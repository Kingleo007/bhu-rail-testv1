from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import TransactionType, TransactionStatus, DepartmentNode

class TransferRequest(BaseModel):
    ulpin: str
    seller_identity_hash: str
    buyer_name: str
    buyer_identity_hash: str
    sale_consideration_inr: float
    deed_doc_hash: str
    sub_registrar_office_code: str = "SRO-GGM-01"

class MortgageRequest(BaseModel):
    ulpin: str
    lender_name: str
    loan_account_no: str
    mortgage_amount_inr: float
    mortgage_deed_doc_hash: str

class MortgageReleaseRequest(BaseModel):
    ulpin: str
    encumbrance_id: str
    release_deed_hash: str
    bank_officer_id: str

class SubdivisionRequest(BaseModel):
    parent_ulpin: str
    splitting_line_coordinates: List[List[float]] # [[lng, lat], [lng, lat]]
    child_owners: List[Dict[str, Any]] # [{"owner_name": "Ramesh", "share": "0.4"}, ...]
    surveyor_license_no: str
    revenue_officer_approval_id: str

class DisputeRequest(BaseModel):
    ulpin: str
    type: str = "BOUNDARY_ENCROACHMENT"
    case_number: str
    adjudicating_authority: str
    petitioner: str
    respondent: str
    claimed_area_sq_meters: Optional[float] = None
    stay_order_doc_hash: str
    freeze_transfer: bool = True
    freeze_mortgage: bool = True

class TransactionRecord(BaseModel):
    transaction_id: str
    type: TransactionType
    target_ulpin: str
    status: TransactionStatus
    initiated_at: str
    completed_at: Optional[str] = None
    completed_steps: List[str] = Field(default_factory=list)
    pending_steps: List[str] = Field(default_factory=list)
    department_signatures: Dict[str, str] = Field(default_factory=dict)
    rule_violations: List[str] = Field(default_factory=list)
    resulting_asset_version: Optional[int] = None
    resulting_ulpins: List[str] = Field(default_factory=list)
    ledger_block_index: Optional[int] = None

class TitleVerificationResponse(BaseModel):
    """Instant 1-click 'Land UPI' response for Banks, Courts & Registry."""
    ulpin: str
    query_timestamp: str
    owner_verified: bool
    current_owners: List[str]
    active_mortgage: bool
    active_court_restriction: bool
    tax_due: bool
    land_use_category: str
    parcel_verified: bool
    transferrable: bool
    active_locks: List[str]
    ledger_audit_status: str # "VERIFIED_TAMPER_FREE" | "WARNING_TAMPER_DETECTED"
