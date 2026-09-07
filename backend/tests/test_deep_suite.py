import pytest
import hashlib
from fastapi.testclient import TestClient
from app.main import app
from app.ledger.audit_chain import ledger, CryptographicLedger
from app.core.property_lock import lock_manager
from app.core.repository import repository
from app.rules.engine import rule_engine
from app.spatial.engine import spatial_engine
from app.adapters.haryana_adapter import haryana_adapter
from app.models.transaction import TransferRequest, SubdivisionRequest, DisputeRequest
from app.models.enums import AssetStatus, EncumbranceType, DisputeStatus

client = TestClient(app)

# ============================================================================
# 1. API ROOT & HEALTH
# ============================================================================
def test_api_root_and_contract():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "OPERATIONAL"
    assert "property_passport" in data["endpoints"]
    assert "land_upi_verification" in data["endpoints"]
    assert "cadastral_geojson" in data["endpoints"]

# ============================================================================
# 2. PARCEL ASSET & PROPERTY PASSPORT ENDPOINTS
# ============================================================================
def test_list_all_parcels():
    res = client.get("/v1/parcels")
    assert res.status_code == 200
    parcels = res.json()
    assert len(parcels) >= 4
    ulpins = [p["ulpin"] for p in parcels]
    assert "IN-HR-GGM-KDP-0101-0000" in ulpins
    assert "IN-HR-GGM-KDP-0102-0000" in ulpins
    assert "IN-HR-GGM-KDP-0104-0000" in ulpins

def test_get_single_parcel_found_and_not_found():
    # Valid ULPIN
    res = client.get("/v1/parcel/IN-HR-GGM-KDP-0101-0000")
    assert res.status_code == 200
    p = res.json()
    assert p["asset_id"] == "AST-HR-KDP-101"
    assert p["spatial"]["village_code"] == "KDP-004"
    assert len(p["rights"]) > 0

    # Non-existent ULPIN
    err_res = client.get("/v1/parcel/INVALID-ULPIN-9999")
    assert err_res.status_code == 404

def test_property_passport_contract():
    res = client.get("/v1/parcel/IN-HR-GGM-KDP-0101-0000/passport")
    assert res.status_code == 200
    passport = res.json()
    assert passport["ulpin"] == "IN-HR-GGM-KDP-0101-0000"
    assert passport["title_verified"] is True
    assert passport["active_mortgage_count"] == 0
    assert passport["active_court_stay"] is False
    assert passport["area_sq_meters"] > 1000.0
    assert passport["tamper_verified"] is True
    assert len(passport["ledger_root_hash"]) == 64

def test_cadastral_geojson_layer():
    res = client.get("/v1/parcel/layers/geojson")
    assert res.status_code == 200
    fc = res.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) >= 4
    for feat in fc["features"]:
        assert feat["type"] == "Feature"
        assert feat["geometry"]["type"] == "Polygon"
        assert "ulpin" in feat["properties"]
        assert "survey_number" in feat["properties"]

# ============================================================================
# 3. LAND UPI VERIFICATION RAIL (SUB-100MS APIS)
# ============================================================================
def test_land_upi_clean_freehold():
    res = client.get("/v1/verification/title-status?ulpin=IN-HR-GGM-KDP-0101-0000")
    assert res.status_code == 200
    data = res.json()
    assert data["owner_verified"] is True
    assert "Suresh Chandra Yadav" in data["current_owners"]
    assert data["active_mortgage"] is False
    assert data["active_court_restriction"] is False
    assert data["transferrable"] is True
    assert data["ledger_audit_status"] == "VERIFIED_TAMPER_FREE"

def test_land_upi_mortgaged_parcel():
    res = client.get("/v1/verification/title-status?ulpin=IN-HR-GGM-KDP-0102-0000")
    assert res.status_code == 200
    data = res.json()
    assert data["owner_verified"] is True
    assert "Neha Verma" in data["current_owners"]
    assert data["active_mortgage"] is True # SBI Mortgage flag
    assert data["transferrable"] is False
    assert "RULE-FINANCIAL-ENCUMBRANCE-ACTIVE" in data["active_locks"]

def test_land_upi_court_stay_parcel():
    res = client.get("/v1/verification/title-status?ulpin=IN-HR-GGM-KDP-0104-0000")
    assert res.status_code == 200
    data = res.json()
    assert data["active_court_restriction"] is True
    assert data["transferrable"] is False
    assert "RULE-JUDICIAL-INJUNCTION-ACTIVE" in data["active_locks"]

def test_land_upi_non_existent():
    res = client.get("/v1/verification/title-status?ulpin=FAKE-ULPIN-0000")
    assert res.status_code == 200
    data = res.json()
    assert data["owner_verified"] is False
    assert data["parcel_verified"] is False
    assert data["transferrable"] is False
    assert "PARCEL_NOT_FOUND" in data["active_locks"]

# ============================================================================
# 4. CONCURRENCY LOCKING & RACE CONDITION CONTROL
# ============================================================================
def test_concurrency_lock_acquisition_and_collision():
    ulpin = "IN-HR-GGM-KDP-0103-0000"
    
    # Release any existing lock on test plot
    lock_manager.release_lock(ulpin, "ANY")
    
    # 1. First transaction acquires lock
    ok1, msg1 = lock_manager.acquire_lock(ulpin, "TX-001", "TEST_TRANSFER")
    assert ok1 is True
    assert lock_manager.is_locked(ulpin) is True

    # 2. Parallel conflicting transaction attempts to acquire lock -> MUST FAIL
    ok2, msg2 = lock_manager.acquire_lock(ulpin, "TX-002", "DUPLICATE_TRANSFER")
    assert ok2 is False
    assert "already locked" in msg2

    # 3. Unauthorized release attempt with wrong transaction ID -> MUST FAIL
    rel_fake, msg_fake = lock_manager.release_lock(ulpin, "TX-WRONG-ID")
    assert rel_fake is False
    assert "mismatch" in msg_fake

    # 4. Legitimate release by owner
    rel_ok, _ = lock_manager.release_lock(ulpin, "TX-001")
    assert rel_ok is True
    assert lock_manager.is_locked(ulpin) is False

# ============================================================================
# 5. RULE ENGINE VALIDATION POLICIES
# ============================================================================
def test_rule_engine_court_stay_blocks_transfer():
    p104 = repository.get_parcel("IN-HR-GGM-KDP-0104-0000")
    eligible, violations = rule_engine.evaluate_transfer_eligibility(p104)
    assert eligible is False
    codes = [v.rule_code for v in violations]
    assert "RULE-JUDICIAL-INJUNCTION-ACTIVE" in codes
    assert "REV/COURT/SOHNA/2024/771" in violations[0].message

def test_rule_engine_mortgage_blocks_transfer():
    p102 = repository.get_parcel("IN-HR-GGM-KDP-0102-0000")
    eligible, violations = rule_engine.evaluate_transfer_eligibility(p102)
    assert eligible is False
    codes = [v.rule_code for v in violations]
    assert "RULE-FINANCIAL-ENCUMBRANCE-ACTIVE" in codes
    assert "State Bank of India" in violations[0].message

def test_rule_engine_lifecycle_status_check():
    # Construct a retired mock parcel
    p101 = repository.get_parcel("IN-HR-GGM-KDP-0101-0000").model_copy(deep=True)
    p101.status = AssetStatus.RETIRED
    eligible, violations = rule_engine.evaluate_transfer_eligibility(p101)
    assert eligible is False
    assert violations[0].rule_code == "RULE-LIFECYCLE-INVALID"

# ============================================================================
# 6. TRANSACTION EXECUTION & FRAUD PREVENTION
# ============================================================================
def test_fraud_prevention_transfer_rejection_api():
    req = {
        "ulpin": "IN-HR-GGM-KDP-0104-0000",
        "seller_identity_hash": "sha256:seller_hash",
        "buyer_name": "Deceptive Buyer",
        "buyer_identity_hash": "sha256:buyer_hash",
        "sale_consideration_inr": 9000000.0,
        "deed_doc_hash": "sha256:deed_hash"
    }
    res = client.post("/v1/transaction/transfer", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "REJECTED"
    assert "TRANSACTION BLOCKED: Active judicial injunction" in data["message"]
    # Verify property is not left locked after rejection
    assert lock_manager.is_locked("IN-HR-GGM-KDP-0104-0000") is False

def test_legitimate_ownership_transfer_execution():
    ulpin = "IN-HR-GGM-KDP-0103-0000" # Clean residential plot
    p_before = repository.get_parcel(ulpin)
    initial_version = p_before.version
    
    req = {
        "ulpin": ulpin,
        "seller_identity_hash": "sha256:seller_amitabh",
        "buyer_name": "Kavita Narang",
        "buyer_identity_hash": "sha256:kavita_aadhaar_hash_4491",
        "sale_consideration_inr": 6200000.0,
        "deed_doc_hash": "sha256:sro_sohna_deed_2026_09",
        "sub_registrar_office_code": "SRO-GGM-01"
    }
    
    res = client.post("/v1/transaction/transfer", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMMITTED"
    assert "Ownership successfully transferred to Kavita Narang" in data["message"]

    # Verify parcel in repository was updated
    p_after = repository.get_parcel(ulpin)
    assert p_after.version == initial_version + 1
    active_owners = [r.holder_name for r in p_after.rights if r.is_active]
    assert "Kavita Narang" in active_owners
    assert "Amitabh Sen" not in active_owners
    assert lock_manager.is_locked(ulpin) is False

# ============================================================================
# 7. SPATIAL ENGINE & SUBDIVISION INTEGRITY
# ============================================================================
def test_spatial_engine_area_and_centroid():
    # Known 100m x 100m approximate coordinates at latitude 28.41
    # 0.001 deg lat ~ 111.3m, 0.001 deg lng ~ 97.6m
    coords = [
        [77.0800, 28.4100],
        [77.0810, 28.4100],
        [77.0810, 28.4110],
        [77.0800, 28.4110],
        [77.0800, 28.4100]
    ]
    area = spatial_engine.calculate_polygon_area_sq_meters(coords)
    assert 10000.0 < area < 11500.0
    
    centroid = spatial_engine.calculate_centroid(coords)
    assert round(centroid[0], 3) == 77.081 or round(centroid[0], 4) == 77.0805
    assert round(centroid[1], 4) == 28.4105

def test_spatial_subdivision_protocol_and_area_conservation():
    parent_ulpin = "IN-HR-GGM-KDP-0108-0000"
    parent = repository.get_parcel(parent_ulpin)
    parent_area = parent.spatial.area_sq_meters

    req = {
        "parent_ulpin": parent_ulpin,
        "splitting_line_coordinates": [],
        "child_owners": [
            {"owner_name": "Balwant Singh Heir A", "share": "1/1"},
            {"owner_name": "Balwant Singh Heir B", "share": "1/1"}
        ],
        "surveyor_license_no": "SURV-LIC-2026-X",
        "revenue_officer_approval_id": "REV-OFFICER-APPR-108"
    }

    res = client.post("/v1/parcel/subdivide", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMMITTED"
    child_ulpins = data["transaction_record"]["resulting_ulpins"]
    assert len(child_ulpins) == 2

    # Verify parent is retired to SUBDIVIDED
    parent_updated = repository.get_parcel(parent_ulpin)
    assert parent_updated.status == AssetStatus.SUBDIVIDED

    # Verify children exist and sum of child areas strictly matches parent area
    child_areas = []
    for c_ulpin in child_ulpins:
        c = repository.get_parcel(c_ulpin)
        assert c is not None
        assert c.status == AssetStatus.ACTIVE
        assert parent_ulpin in c.lineage.parent_ulpins
        child_areas.append(c.spatial.area_sq_meters)

    assert round(sum(child_areas), 2) == round(parent_area, 2)

# ============================================================================
# 8. DISPUTE INJECTION & DYNAMIC TRANSACTION FREEZE
# ============================================================================
def test_dynamic_court_dispute_injection_and_subsequent_freeze():
    target = "IN-HR-GGM-KDP-0101-0000" # Initially clean
    
    # 1. File new court dispute
    disp_req = {
        "ulpin": target,
        "type": "BOUNDARY_ENCROACHMENT",
        "case_number": "SUIT/2026/GGM/9012",
        "adjudicating_authority": "Civil Court Gurugram",
        "petitioner": "Panchayat Kadarpur",
        "respondent": "Suresh Chandra Yadav",
        "claimed_area_sq_meters": 120.0,
        "stay_order_doc_hash": "sha256:signed_stay_injunction_order",
        "freeze_transfer": True,
        "freeze_mortgage": True
    }
    res = client.post("/v1/dispute/file", json=disp_req)
    assert res.status_code == 200
    assert res.json()["status"] == "RECORDED"

    # 2. Query title status -> must now report active court restriction
    v_res = client.get(f"/v1/verification/title-status?ulpin={target}")
    assert v_res.json()["active_court_restriction"] is True
    assert v_res.json()["transferrable"] is False

    # 3. Attempting to sell target now MUST BE REJECTED
    sale_req = {
        "ulpin": target,
        "seller_identity_hash": "sha256:suresh_hash",
        "buyer_name": "Rohan Gupta",
        "buyer_identity_hash": "sha256:rohan_hash",
        "sale_consideration_inr": 10000000.0,
        "deed_doc_hash": "sha256:sale_deed_hash"
    }
    tx_res = client.post("/v1/transaction/transfer", json=sale_req)
    assert tx_res.json()["status"] == "REJECTED"
    assert "Active judicial injunction in Case SUIT/2026/GGM/9012" in tx_res.json()["message"]

# ============================================================================
# 9. PERMISSIONED CRYPTOGRAPHIC LEDGER & TAMPER DETECTION
# ============================================================================
def test_ledger_chain_audit_and_tamper_defense():
    # 1. Verify ledger is valid initially
    audit = ledger.verify_ledger_integrity()
    assert audit.is_valid is True
    assert audit.total_blocks > 0
    assert audit.tamper_detected_at_block is None

    # 2. Corrupt previous_hash of block 1
    if len(ledger.chain) > 1:
        saved_prev = ledger.chain[1].previous_hash
        ledger.chain[1].previous_hash = "0" * 64 # Maliciously severed pointer
        
        tampered_audit = ledger.verify_ledger_integrity()
        assert tampered_audit.is_valid is False
        assert tampered_audit.tamper_detected_at_block == 1
        assert "Broken hash chain link" in tampered_audit.audit_notes[0]

        # Restore
        ledger.chain[1].previous_hash = saved_prev
        assert ledger.verify_ledger_integrity().is_valid is True

# ============================================================================
# 10. STATE ADAPTER LAYER (HARYANA JAMABANDI)
# ============================================================================
def test_haryana_jamabandi_state_adapter():
    raw_record = {
        "murabba_no": "48",
        "khasra_no": "12",
        "village_name": "Kadarpur",
        "village_code": "HR-KDP-001",
        "khewatdar_name": "Dharampal Singh",
        "id_ref": "AADHAAR:1234-5678-9012",
        "share_detail": "1/2",
        "cultivation_type": "AGRICULTURAL",
        "coordinates": [
            [77.0850, 28.4100], [77.0860, 28.4100],
            [77.0860, 28.4110], [77.0850, 28.4110], [77.0850, 28.4100]
        ]
    }
    canonical = haryana_adapter.transform_to_canonical(raw_record)
    assert canonical.ulpin == "IN-HR-GGM-KAD-0048-0012"
    assert canonical.spatial.survey_number == "48//12"
    assert canonical.rights[0].holder_name == "Dharampal Singh"
    assert canonical.rights[0].share_fraction == "1/2"
    assert canonical.zoning.land_use_category == "AGRICULTURAL"
    assert canonical.status == AssetStatus.ACTIVE
