from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class LedgerBlock(BaseModel):
    index: int
    timestamp: str
    ulpin: str
    transaction_id: str
    event_type: str
    previous_hash: str
    payload_hash: str
    state_after_transition_hash: str
    department_signatures: Dict[str, str] = Field(default_factory=dict)
    block_hash: str

class AuditVerificationResult(BaseModel):
    ulpin: str
    is_valid: bool
    total_blocks: int
    verified_blocks: int
    genesis_timestamp: str
    latest_block_hash: str
    tamper_detected_at_block: Optional[int] = None
    audit_notes: List[str] = Field(default_factory=list)
