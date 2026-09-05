from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
from app.models.parcel import ConcurrencyLock

class PropertyLockManager:
    """
    Guarantees strict transaction concurrency control.
    Prevents parallel conflicting mutations or fraudulent double-sale submissions.
    """
    def __init__(self):
        self._locks: Dict[str, ConcurrencyLock] = {}

    def is_locked(self, ulpin: str) -> bool:
        lock = self._locks.get(ulpin)
        return lock.is_locked if lock else False

    def get_lock(self, ulpin: str) -> ConcurrencyLock:
        return self._locks.get(ulpin, ConcurrencyLock(is_locked=False))

    def acquire_lock(
        self,
        ulpin: str,
        transaction_id: str,
        reason: str,
        department: str = "SUB_REGISTRAR"
    ) -> Tuple[bool, str]:
        if self.is_locked(ulpin):
            current = self._locks[ulpin]
            return False, f"Parcel {ulpin} is already locked by Transaction {current.active_transaction_id} ({current.lock_reason})"

        lock = ConcurrencyLock(
            is_locked=True,
            lock_reason=reason,
            locked_at=datetime.now(timezone.utc).isoformat(),
            active_transaction_id=transaction_id,
            locked_by_department=department
        )
        self._locks[ulpin] = lock
        return True, "Lock successfully acquired"

    def release_lock(self, ulpin: str, transaction_id: str) -> Tuple[bool, str]:
        if not self.is_locked(ulpin):
            return True, "Parcel was not locked"
        
        current = self._locks[ulpin]
        if current.active_transaction_id != transaction_id:
            return False, f"Lock ownership mismatch: cannot release lock held by {current.active_transaction_id}"

        self._locks[ulpin] = ConcurrencyLock(is_locked=False)
        return True, "Lock released"

# Global singleton instance
lock_manager = PropertyLockManager()
