import hashlib
from datetime import datetime, timezone
from typing import Dict, Any
from app.adapters.base import StateCadastreAdapter
from app.models.parcel import ParcelAsset, SpatialMetadata, ZoningMetadata, ParcelLineage
from app.models.spatial import GeoJSONGeometry
from app.models.rights import LandRight
from app.models.enums import AssetStatus, RightType
from app.spatial.engine import spatial_engine

class HaryanaJamabandiAdapter(StateCadastreAdapter):
    """
    Adapter for Haryana Land Records Information System (HALRIS / Jamabandi).
    Maps Murabba, Khasra, Khewat, Khatauni to canonical ULPIN and Land Rights.
    """
    def get_state_code(self) -> str:
        return "HR"

    def transform_to_canonical(self, raw_record: Dict[str, Any]) -> ParcelAsset:
        murabba = raw_record.get("murabba_no", "0")
        khasra = raw_record.get("khasra_no", "0")
        village = raw_record.get("village_name", "Kadarpur")
        
        # Generate canonical ULPIN
        ulpin = f"IN-HR-GGM-{village[:3].upper()}-{murabba.zfill(4)}-{khasra.zfill(4)}"
        
        coords = raw_record.get("coordinates", [
            [77.0850, 28.4100], [77.0860, 28.4100],
            [77.0860, 28.4110], [77.0850, 28.4110], [77.0850, 28.4100]
        ])
        area = spatial_engine.calculate_polygon_area_sq_meters(coords)
        
        right = LandRight(
            right_id=f"RT-HR-{khasra}",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name=raw_record.get("khewatdar_name", "Unknown Holder"),
            holder_identity_hash=hashlib.sha256(raw_record.get("id_ref", "NA").encode()).hexdigest(),
            share_fraction=raw_record.get("share_detail", "1/1"),
            valid_from=datetime.now(timezone.utc).isoformat(),
            issuing_authority="Revenue Officer Haryana (Jamabandi)",
            is_active=True
        )

        return ParcelAsset(
            ulpin=ulpin,
            asset_id=f"AST-HR-{murabba}-{khasra}",
            version=1,
            status=AssetStatus.ACTIVE,
            geometry=GeoJSONGeometry(coordinates=[coords]),
            spatial=SpatialMetadata(
                area_sq_meters=area,
                survey_number=f"{murabba}//{khasra}",
                village_code=raw_record.get("village_code", "HR-KDP-001"),
                centroid=spatial_engine.calculate_centroid(coords),
                survey_date=datetime.now(timezone.utc).isoformat()
            ),
            rights=[right],
            encumbrances=[],
            disputes=[],
            zoning=ZoningMetadata(land_use_category=raw_record.get("cultivation_type", "AGRICULTURAL")),
            state_hash=hashlib.sha256(f"{ulpin}:ACTIVE:1:1:0:0".encode()).hexdigest(),
            created_at=datetime.now(timezone.utc).isoformat(),
            updated_at=datetime.now(timezone.utc).isoformat()
        )

haryana_adapter = HaryanaJamabandiAdapter()
