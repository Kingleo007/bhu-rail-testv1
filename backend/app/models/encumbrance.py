from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import EncumbranceType

class Encumbrance(BaseModel):
    encumbrance_id: str = Field(..., description="Unique encumbrance ID e.g. ENC-001")
    type: EncumbranceType
    institution_name: str = Field(..., description="Name of claiming entity e.g. State Bank of India, MCG")
    claim_amount_inr: Optional[float] = Field(default=None, description="Monetary claim value if financial")
    date_registered: str
    discharge_date: Optional[str] = None
    reference_document_no: str
    is_active: bool = True
    remarks: Optional[str] = None
