from fastapi import APIRouter, HTTPException, Query
from app.models.transaction import TitleVerificationResponse
from app.core.repository import repository

router = APIRouter(prefix="/v1/verification", tags=["Land UPI Verification Rail"])

@router.get("/title-status", response_model=TitleVerificationResponse)
def verify_title_status(ulpin: str = Query(..., description="14 or 26-digit ULPIN")):
    """
    LAND UPI RAIL: High-speed, 1-click machine-readable Title & Collateral Verification.
    Used by Banks, NBFCs, Courts, and Registry offices.
    Returns clean boolean verification flags in sub-100 milliseconds.
    """
    return repository.verify_title_status(ulpin)
