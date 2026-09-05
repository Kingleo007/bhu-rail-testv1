from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import RightType

class LandRight(BaseModel):
    right_id: str = Field(..., description="Unique right identifier e.g. RT-001")
    type: RightType
    holder_name: str
    holder_identity_hash: str = Field(..., description="SHA-256 hash of Aadhaar/PAN/CIN to guarantee citizen privacy")
    share_fraction: str = Field(default="1/1", description="Fractional share e.g. 1/1, 1/2, 1/4")
    valid_from: str = Field(..., description="ISO 8601 start date")
    valid_until: Optional[str] = None
    issuing_authority: str
    title_deed_doc_id: Optional[str] = None
    title_deed_hash: Optional[str] = None
    is_active: bool = True
