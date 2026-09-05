from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import AssetStatus
from app.models.spatial import GeoJSONGeometry, SpatialMetadata
from app.models.rights import LandRight
from app.models.encumbrance import Encumbrance
from app.models.dispute import Dispute

class ConcurrencyLock(BaseModel):
    is_locked: bool = False
    lock_reason: Optional[str] = None
    locked_at: Optional[str] = None
    active_transaction_id: Optional[str] = None
    locked_by_department: Optional[str] = None

class ParcelLineage(BaseModel):
    parent_ulpins: List[str] = Field(default_factory=list, description="Parent parcels if formed via subdivision")
    child_ulpins: List[str] = Field(default_factory=list, description="Child parcels if subdivided")
    subdivision_timestamp: Optional[str] = None
    genealogy_depth: int = 0

class ZoningMetadata(BaseModel):
    land_use_category: str = Field(default="RESIDENTIAL", description="AGRICULTURAL, RESIDENTIAL, COMMERCIAL, INDUSTRIAL, FOREST")
    permissible_far: float = 1.75
    building_height_limit_meters: float = 15.0
    is_acquisition_zone: bool = False
    is_flood_hazard_zone: bool = False
    environmental_clearance_required: bool = False

class ParcelAsset(BaseModel):
    ulpin: str = Field(..., description="Unique Land Parcel Identification Number (14/26 alphanumeric)")
    asset_id: str = Field(..., description="Canonical Land DPI asset identifier e.g. AST-HR-GGM-104")
    version: int = Field(default=1, description="Sequential version incremented on state mutations")
    state_code: str = "HR"
    district: str = "Gurugram"
    tehsil: str = "Sohna"
    village: str = "Kadarpur"
    status: AssetStatus = AssetStatus.ACTIVE
    
    # Core facets
    geometry: GeoJSONGeometry
    spatial: SpatialMetadata
    lineage: ParcelLineage = Field(default_factory=ParcelLineage)
    rights: List[LandRight] = Field(default_factory=list)
    encumbrances: List[Encumbrance] = Field(default_factory=list)
    disputes: List[Dispute] = Field(default_factory=list)
    zoning: ZoningMetadata = Field(default_factory=ZoningMetadata)
    concurrency_lock: ConcurrencyLock = Field(default_factory=ConcurrencyLock)
    
    # Cryptographic integrity
    state_hash: str = Field(..., description="Current cryptographic SHA-256 fingerprint of parcel state")
    created_at: str
    updated_at: str

class PropertyPassport(BaseModel):
    """The machine-readable standardized Property Passport exposed to external apps and banks."""
    ulpin: str
    asset_id: str
    version: int
    status: AssetStatus
    
    # Summary flags
    title_verified: bool
    active_mortgage_count: int
    active_court_stay: bool
    tax_status_clear: bool
    land_use: str
    building_permission_eligible: bool
    
    # Core details
    area_sq_meters: float
    current_owners: List[str]
    encumbrances: List[Encumbrance]
    active_disputes: List[Dispute]
    lineage: ParcelLineage
    geometry: GeoJSONGeometry
    centroid: List[float]
    
    # Ledger verification
    ledger_root_hash: str
    last_state_transition: str
    tamper_verified: bool
    passport_generated_at: str
