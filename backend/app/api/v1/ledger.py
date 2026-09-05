from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.ledger import LedgerBlock, AuditVerificationResult
from app.ledger.audit_chain import ledger

router = APIRouter(prefix="/v1/ledger", tags=["Cryptographic Trust & Ledger"])

@router.get("/blocks", response_model=List[LedgerBlock])
def get_global_blocks(limit: int = 50):
    """Fetch global ledger blocks."""
    return ledger.chain[-limit:]

@router.get("/{ulpin}/history", response_model=List[LedgerBlock])
def get_parcel_ledger_history(ulpin: str):
    """Retrieve immutable chronological state transition blocks for a given ULPIN."""
    blocks = ledger.get_history_for_ulpin(ulpin)
    if not blocks:
        raise HTTPException(status_code=404, detail=f"No ledger history recorded for ULPIN '{ulpin}'")
    return blocks

@router.get("/verify/audit", response_model=AuditVerificationResult)
def verify_ledger_integrity(ulpin: Optional[str] = Query(None, description="Optional ULPIN to verify")):
    """
    Audits and cryptographically verifies the SHA-256 block chain from Genesis.
    Returns proof of tamper-evidence or flags compromised blocks.
    """
    return ledger.verify_ledger_integrity(ulpin)
