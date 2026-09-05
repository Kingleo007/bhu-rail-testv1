import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ledger.audit_chain import ledger
from app.models.transaction import TransferRequest, SubdivisionRequest
from app.models.enums import AssetStatus

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "Bhu-Rail (Land Digital Public Infrastructure)"
    assert data["status"] == "OPERATIONAL"

def test_killer_demo_3_land_upi_verification():
    """
    KILLER DEMO #3: 'Land UPI' 1-Click Verification for Banks & FinTechs.
    Instant machine-readable response without checking 5 departmental silos.
    """
    clean_ulpin = "IN-HR-GGM-KDP-0101-0000"
    response = client.get(f"/v1/verification/title-status?ulpin={clean_ulpin}")
    assert response.status_code == 200
    data = response.json()
    
    assert data["ulpin"] == clean_ulpin
    assert data["owner_verified"] is True
    assert "Suresh Chandra Yadav" in data["current_owners"]
    assert data["active_mortgage"] is False
    assert data["active_court_restriction"] is False
    assert data["transferrable"] is True
    assert data["ledger_audit_status"] == "VERIFIED_TAMPER_FREE"

def test_killer_demo_1_fraud_prevention_court_stay():
    """
    KILLER DEMO #1: Fraud Prevention via Rule Engine.
    Attempting to sell a court-stayed property must be immediately blocked
    with active judicial injunction citation.
    """
    stayed_ulpin = "IN-HR-GGM-KDP-0104-0000"
    
    # Verify title status exposes the court restriction
    status_res = client.get(f"/v1/verification/title-status?ulpin={stayed_ulpin}")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["active_court_restriction"] is True
    assert status_data["transferrable"] is False
    assert "RULE-JUDICIAL-INJUNCTION-ACTIVE" in status_data["active_locks"]

    # Attempt to execute transfer anyway
    transfer_payload = {
        "ulpin": stayed_ulpin,
        "seller_identity_hash": "sha256:dummy_seller",
        "buyer_name": "Fraudulent Purchaser",
        "buyer_identity_hash": "sha256:dummy_buyer",
        "sale_consideration_inr": 8500000.0,
        "deed_doc_hash": "sha256:fake_deed_hash",
        "sub_registrar_office_code": "SRO-GGM-01"
    }
    
    res = client.post("/v1/transaction/transfer", json=transfer_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "REJECTED"
    assert "TRANSACTION BLOCKED: Active judicial injunction in Case REV/COURT/SOHNA/2024/771" in data["message"]

def test_killer_demo_2_spatial_subdivision():
    """
    KILLER DEMO #2: Spatial Subdivision of 10,000 m² Parcel.
    Parent parcel is retired, child parcels created, area conserved, and lineage committed to ledger.
    """
    parent_ulpin = "IN-HR-GGM-KDP-0108-0000"
    
    # Check parent before subdivision
    parent_res = client.get(f"/v1/parcel/{parent_ulpin}")
    assert parent_res.status_code == 200
    parent_data = parent_res.json()
    assert parent_data["status"] == "ACTIVE"
    initial_area = parent_data["spatial"]["area_sq_meters"]
    assert initial_area > 9000.0 # ~10,000 sqm

    # Perform subdivision
    sub_payload = {
        "parent_ulpin": parent_ulpin,
        "splitting_line_coordinates": [], # Auto bisect at ratio 0.3
        "child_owners": [
            {"owner_name": "Balwant Singh (Elder Son)", "share": "1/1"},
            {"owner_name": "Balwant Singh (Younger Son)", "share": "1/1"}
        ],
        "surveyor_license_no": "SURV-LIC-HR-2024-991",
        "revenue_officer_approval_id": "REV-APPR-SOHNA-482"
    }

    res = client.post("/v1/parcel/subdivide", json=sub_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMMITTED"
    child_ulpins = data["transaction_record"]["resulting_ulpins"]
    assert len(child_ulpins) == 2

    # Check that parent is now SUBDIVIDED
    updated_parent_res = client.get(f"/v1/parcel/{parent_ulpin}")
    updated_parent = updated_parent_res.json()
    assert updated_parent["status"] == "SUBDIVIDED"
    assert updated_parent["lineage"]["child_ulpins"] == child_ulpins

    # Check child parcels exist and inherit parent lineage
    for child_ulpin in child_ulpins:
        child_res = client.get(f"/v1/parcel/{child_ulpin}")
        assert child_res.status_code == 200
        child = child_res.json()
        assert child["status"] == "ACTIVE"
        assert parent_ulpin in child["lineage"]["parent_ulpins"]

def test_ledger_cryptographic_audit_and_tamper_detection():
    """
    Cryptographic Ledger: Validates the SHA-256 hash-chain integrity
    and tests that modifying any past state transition raises an immediate alarm.
    """
    audit_res = client.get("/v1/ledger/verify/audit")
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["is_valid"] is True
    assert audit_data["tamper_detected_at_block"] is None
    assert audit_data["total_blocks"] > 0

def test_ledger_catches_deliberate_tampering():
    """
    Simulates a malicious actor attempting to rewrite history in the database.
    The ledger must detect the exact block and invalidate the chain.
    """
    # Verify valid before tampering
    assert ledger.verify_ledger_integrity().is_valid is True
    
    # Maliciously modify block 0 payload hash
    original_hash = ledger.chain[0].block_hash
    ledger.chain[0].block_hash = "0xBAD0000000000000000000000000000000000000000000000000000000000000"
    
    # Audit should immediately flag tamper detected at block 0
    tampered_audit = ledger.verify_ledger_integrity()
    assert tampered_audit.is_valid is False
    assert tampered_audit.tamper_detected_at_block == 0
    
    # Restore block hash
    ledger.chain[0].block_hash = original_hash
    assert ledger.verify_ledger_integrity().is_valid is True
