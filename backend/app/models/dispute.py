from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.enums import DisputeType, DisputeStatus

class Dispute(BaseModel):
    dispute_id: str = Field(..., description="Unique dispute ID e.g. DISP-2025-098")
    type: DisputeType
    status: DisputeStatus = DisputeStatus.INJUNCTION_ISSUED
    case_number: str = Field(..., description="Court / Revenue Tribunal case reference")
    adjudicating_authority: str = Field(..., description="Court e.g. Revenue Court Gurgaon, Civil Court")
    petitioner: str
    respondent: str
    claimed_area_sq_meters: Optional[float] = None
    injunction_freeze_transfers: bool = Field(default=True, description="Enforces strict lock on property transfer")
    injunction_freeze_mortgage: bool = Field(default=True, description="Enforces lock on institutional mortgages")
    date_filed: str
    last_hearing_date: Optional[str] = None
    stay_order_doc_hash: str = Field(..., description="Cryptographic hash of the judicial stay order")
    remarks: Optional[str] = None
