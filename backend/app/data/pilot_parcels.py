import hashlib
from typing import Dict, List
from datetime import datetime, timezone
from app.models.parcel import ParcelAsset, SpatialMetadata, ZoningMetadata, ParcelLineage, ConcurrencyLock
from app.models.spatial import GeoJSONGeometry
from app.models.rights import LandRight
from app.models.encumbrance import Encumbrance
from app.models.dispute import Dispute
from app.models.enums import AssetStatus, RightType, EncumbranceType, DisputeStatus, DisputeType
from app.spatial.engine import spatial_engine

def sha(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def compute_state_hash(ulpin: str, status: str, version: int, rights: list, encumbrances: list, disputes: list) -> str:
    raw = f"{ulpin}:{status}:{version}:{len(rights)}:{len(encumbrances)}:{len(disputes)}"
    return sha(raw)

def get_initial_pilot_parcels() -> Dict[str, ParcelAsset]:
    now = datetime.now(timezone.utc).isoformat()
    parcels: Dict[str, ParcelAsset] = {}

    # -------------------------------------------------------------
    # Parcel 1: CLEAN FREEHOLD PARCEL (Ready for Land UPI Verification)
    # ULPIN: IN-HR-GGM-KDP-0101-0000 (Area ~1,850 m²)
    # -------------------------------------------------------------
    coords_101 = [
        [77.081200, 28.411000],
        [77.082200, 28.411050],
        [77.082150, 28.411800],
        [77.081150, 28.411750],
        [77.081200, 28.411000]
    ]
    p101_rights = [
        LandRight(
            right_id="RT-HR-KDP-101-01",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name="Suresh Chandra Yadav",
            holder_identity_hash=sha("AADHAAR:8921-4921-3921"),
            share_fraction="1/1",
            valid_from="2016-04-12T00:00:00Z",
            issuing_authority="Sub-Registrar Sohna",
            title_deed_doc_id="REG-DEED-2016-8921",
            title_deed_hash=sha("DOC:DEED:101:2016"),
            is_active=True
        )
    ]
    parcels["IN-HR-GGM-KDP-0101-0000"] = ParcelAsset(
        ulpin="IN-HR-GGM-KDP-0101-0000",
        asset_id="AST-HR-KDP-101",
        version=1,
        status=AssetStatus.ACTIVE,
        geometry=GeoJSONGeometry(coordinates=[coords_101]),
        spatial=SpatialMetadata(
            area_sq_meters=spatial_engine.calculate_polygon_area_sq_meters(coords_101),
            survey_number="101",
            village_code="KDP-004",
            centroid=spatial_engine.calculate_centroid(coords_101),
            survey_date="2023-10-15T00:00:00Z"
        ),
        rights=p101_rights,
        encumbrances=[],
        disputes=[],
        zoning=ZoningMetadata(land_use_category="RESIDENTIAL", permissible_far=1.75),
        state_hash=compute_state_hash("IN-HR-GGM-KDP-0101-0000", "ACTIVE", 1, p101_rights, [], []),
        created_at="2023-10-15T00:00:00Z",
        updated_at=now
    )

    # -------------------------------------------------------------
    # Parcel 2: SBI MORTGAGED PARCEL
    # ULPIN: IN-HR-GGM-KDP-0102-0000 (Area ~2,400 m²)
    # -------------------------------------------------------------
    coords_102 = [
        [77.082200, 28.411050],
        [77.083500, 28.411100],
        [77.083450, 28.411850],
        [77.082150, 28.411800],
        [77.082200, 28.411050]
    ]
    p102_rights = [
        LandRight(
            right_id="RT-HR-KDP-102-01",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name="Neha Verma",
            holder_identity_hash=sha("AADHAAR:4812-9214-5512"),
            share_fraction="1/1",
            valid_from="2020-02-18T00:00:00Z",
            issuing_authority="Sub-Registrar Sohna",
            title_deed_doc_id="REG-DEED-2020-3021",
            title_deed_hash=sha("DOC:DEED:102:2020"),
            is_active=True
        )
    ]
    p102_encumbrances = [
        Encumbrance(
            encumbrance_id="ENC-HR-SBI-2022-049",
            type=EncumbranceType.BANK_MORTGAGE,
            institution_name="State Bank of India (Gurugram Branch)",
            claim_amount_inr=4500000.00,
            date_registered="2022-06-14T00:00:00Z",
            reference_document_no="SBI/MORT/2022/9912",
            is_active=True,
            remarks="Equitable mortgage against term loan"
        )
    ]
    parcels["IN-HR-GGM-KDP-0102-0000"] = ParcelAsset(
        ulpin="IN-HR-GGM-KDP-0102-0000",
        asset_id="AST-HR-KDP-102",
        version=2,
        status=AssetStatus.ACTIVE,
        geometry=GeoJSONGeometry(coordinates=[coords_102]),
        spatial=SpatialMetadata(
            area_sq_meters=spatial_engine.calculate_polygon_area_sq_meters(coords_102),
            survey_number="102",
            village_code="KDP-004",
            centroid=spatial_engine.calculate_centroid(coords_102),
            survey_date="2023-10-15T00:00:00Z"
        ),
        rights=p102_rights,
        encumbrances=p102_encumbrances,
        disputes=[],
        zoning=ZoningMetadata(land_use_category="COMMERCIAL", permissible_far=2.0),
        state_hash=compute_state_hash("IN-HR-GGM-KDP-0102-0000", "ACTIVE", 2, p102_rights, p102_encumbrances, []),
        created_at="2020-02-18T00:00:00Z",
        updated_at=now
    )

    # -------------------------------------------------------------
    # Parcel 3: COURT-STAYED PARCEL (DEMO 1: FRAUD ATTEMPT PREVENTION)
    # ULPIN: IN-HR-GGM-KDP-0104-0000 (Area ~3,100 m²)
    # -------------------------------------------------------------
    coords_104 = [
        [77.081150, 28.411750],
        [77.082150, 28.411800],
        [77.082100, 28.412800],
        [77.081100, 28.412750],
        [77.081150, 28.411750]
    ]
    p104_rights = [
        LandRight(
            right_id="RT-HR-KDP-104-01",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name="Rajesh Sharma",
            holder_identity_hash=sha("AADHAAR:7129-3810-1192"),
            share_fraction="1/1",
            valid_from="2014-08-10T00:00:00Z",
            issuing_authority="Sub-Registrar Sohna",
            title_deed_doc_id="REG-DEED-2014-1144",
            title_deed_hash=sha("DOC:DEED:104:2014"),
            is_active=True
        )
    ]
    p104_disputes = [
        Dispute(
            dispute_id="DISP-REV-2024-771",
            type=DisputeType.BOUNDARY_ENCROACHMENT,
            status=DisputeStatus.INJUNCTION_ISSUED,
            case_number="REV/COURT/SOHNA/2024/771",
            adjudicating_authority="Court of Sub-Divisional Magistrate (Revenue Court) Sohna",
            petitioner="Gram Panchayat Kadarpur",
            respondent="Rajesh Sharma",
            claimed_area_sq_meters=145.0,
            injunction_freeze_transfers=True,
            injunction_freeze_mortgage=True,
            date_filed="2024-03-12T00:00:00Z",
            stay_order_doc_hash=sha("COURT:STAY:ORDER:REV:771:2024"),
            remarks="Status quo ordered on northern boundary adjacent to village passage"
        )
    ]
    parcels["IN-HR-GGM-KDP-0104-0000"] = ParcelAsset(
        ulpin="IN-HR-GGM-KDP-0104-0000",
        asset_id="AST-HR-KDP-104",
        version=3,
        status=AssetStatus.ACTIVE,
        geometry=GeoJSONGeometry(coordinates=[coords_104]),
        spatial=SpatialMetadata(
            area_sq_meters=spatial_engine.calculate_polygon_area_sq_meters(coords_104),
            survey_number="104",
            village_code="KDP-004",
            centroid=spatial_engine.calculate_centroid(coords_104),
            survey_date="2023-10-15T00:00:00Z"
        ),
        rights=p104_rights,
        encumbrances=[],
        disputes=p104_disputes,
        zoning=ZoningMetadata(land_use_category="AGRICULTURAL"),
        state_hash=compute_state_hash("IN-HR-GGM-KDP-0104-0000", "ACTIVE", 3, p104_rights, [], p104_disputes),
        created_at="2014-08-10T00:00:00Z",
        updated_at=now
    )

    # -------------------------------------------------------------
    # Parcel 4: LARGE PARCEL PRIMED FOR SUBDIVISION (DEMO 2: SUBDIVISION)
    # ULPIN: IN-HR-GGM-KDP-0108-0000 (Area ~10,000 m²)
    # -------------------------------------------------------------
    coords_108 = [
        [77.082150, 28.411800],
        [77.084500, 28.411900],
        [77.084400, 28.413200],
        [77.082100, 28.413100],
        [77.082150, 28.411800]
    ]
    p108_rights = [
        LandRight(
            right_id="RT-HR-KDP-108-01",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name="Sardar Balwant Singh Dhillon",
            holder_identity_hash=sha("AADHAAR:6621-8841-9920"),
            share_fraction="1/1",
            valid_from="2012-05-19T00:00:00Z",
            issuing_authority="Sub-Registrar Sohna",
            title_deed_doc_id="REG-DEED-2012-5108",
            title_deed_hash=sha("DOC:DEED:108:2012"),
            is_active=True
        )
    ]
    parcels["IN-HR-GGM-KDP-0108-0000"] = ParcelAsset(
        ulpin="IN-HR-GGM-KDP-0108-0000",
        asset_id="AST-HR-KDP-108",
        version=1,
        status=AssetStatus.ACTIVE,
        geometry=GeoJSONGeometry(coordinates=[coords_108]),
        spatial=SpatialMetadata(
            area_sq_meters=spatial_engine.calculate_polygon_area_sq_meters(coords_108),
            survey_number="108",
            village_code="KDP-004",
            centroid=spatial_engine.calculate_centroid(coords_108),
            survey_date="2023-10-15T00:00:00Z"
        ),
        rights=p108_rights,
        encumbrances=[],
        disputes=[],
        zoning=ZoningMetadata(land_use_category="AGRICULTURAL"),
        state_hash=compute_state_hash("IN-HR-GGM-KDP-0108-0000", "ACTIVE", 1, p108_rights, [], []),
        created_at="2012-05-19T00:00:00Z",
        updated_at=now
    )

    # -------------------------------------------------------------
    # Parcel 5: ADJACENT RESIDENTIAL PLOT 103
    # ULPIN: IN-HR-GGM-KDP-0103-0000 (Area ~1,900 m²)
    # -------------------------------------------------------------
    coords_103 = [
        [77.083500, 28.411100],
        [77.084500, 28.411150],
        [77.084500, 28.411900],
        [77.083450, 28.411850],
        [77.083500, 28.411100]
    ]
    p103_rights = [
        LandRight(
            right_id="RT-HR-KDP-103-01",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name="Amitabh Sen",
            holder_identity_hash=sha("AADHAAR:1198-3344-7721"),
            share_fraction="1/1",
            valid_from="2021-11-04T00:00:00Z",
            issuing_authority="Sub-Registrar Sohna",
            title_deed_doc_id="REG-DEED-2021-8812",
            title_deed_hash=sha("DOC:DEED:103:2021"),
            is_active=True
        )
    ]
    parcels["IN-HR-GGM-KDP-0103-0000"] = ParcelAsset(
        ulpin="IN-HR-GGM-KDP-0103-0000",
        asset_id="AST-HR-KDP-103",
        version=1,
        status=AssetStatus.ACTIVE,
        geometry=GeoJSONGeometry(coordinates=[coords_103]),
        spatial=SpatialMetadata(
            area_sq_meters=spatial_engine.calculate_polygon_area_sq_meters(coords_103),
            survey_number="103",
            village_code="KDP-004",
            centroid=spatial_engine.calculate_centroid(coords_103),
            survey_date="2023-10-15T00:00:00Z"
        ),
        rights=p103_rights,
        encumbrances=[],
        disputes=[],
        zoning=ZoningMetadata(land_use_category="RESIDENTIAL"),
        state_hash=compute_state_hash("IN-HR-GGM-KDP-0103-0000", "ACTIVE", 1, p103_rights, [], []),
        created_at="2021-11-04T00:00:00Z",
        updated_at=now
    )

    return parcels
