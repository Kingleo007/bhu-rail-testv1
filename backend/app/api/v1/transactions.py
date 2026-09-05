from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.models.transaction import (
    TransferRequest, SubdivisionRequest, DisputeRequest, TransactionRecord
)
from app.core.repository import repository

router = APIRouter(prefix="/v1", tags=["Transactions & Life-cycle Engine"])

@router.post("/transaction/transfer")
def transfer_property(req: TransferRequest):
    """
    Executes a Property Ownership Transfer with atomic locking and rule verification.
    If a parcel has a Court Stay or active Mortgage without NOC, this endpoint
    rejects the transaction cryptographically (KILLER DEMO 1).
    """
    success, message, tx = repository.execute_transfer(req)
    if not success:
        return {
            "status": "REJECTED",
            "message": message,
            "transaction_record": tx
        }
    return {
        "status": "COMMITTED",
        "message": message,
        "transaction_record": tx
    }

@router.post("/parcel/subdivide")
def subdivide_parcel(req: SubdivisionRequest):
    """
    KILLER DEMO 2: Spatial subdivision of an active parcel.
    Retires parent, creates child parcels, preserves area and parent-child genealogy.
    """
    success, message, tx = repository.execute_subdivision(req)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {
        "status": "COMMITTED",
        "message": message,
        "transaction_record": tx
    }

@router.post("/dispute/file")
def file_court_dispute(req: DisputeRequest):
    """
    Registers a judicial court order or dispute on a parcel, immediately
    triggering an automatic transfer freeze (KILLER DEMO 1 Part A).
    """
    success, message, dispute = repository.file_dispute(req)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {
        "status": "RECORDED",
        "message": message,
        "dispute": dispute
    }
