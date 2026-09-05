import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple
from app.models.ledger import LedgerBlock, AuditVerificationResult

class CryptographicLedger:
    def __init__(self):
        # Global ledger chain and per-ULPIN chain indexes
        self.chain: List[LedgerBlock] = []
        self.ulpin_indexes: Dict[str, List[int]] = {}
        
        # Institutional node secret signing keys (simulated PKI certs)
        self.dept_signing_keys = {
            "REVENUE_DEPARTMENT": "secret_privkey_rev_dept_sec_01",
            "SUB_REGISTRAR": "secret_privkey_sro_ggm_sec_02",
            "SURVEY_DEPARTMENT": "secret_privkey_survey_sec_03",
            "REVENUE_COURT": "secret_privkey_court_sec_04",
            "FINANCIAL_INSTITUTION": "secret_privkey_sbi_sec_05"
        }

    def _hash_string(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def generate_department_signature(self, dept_name: str, payload_hash: str) -> str:
        key = self.dept_signing_keys.get(dept_name, "default_node_key")
        raw = f"{dept_name}:{payload_hash}:{key}"
        return f"SIG_{dept_name[:3]}_{self._hash_string(raw)[:16]}"

    def calculate_block_hash(
        self,
        index: int,
        timestamp: str,
        ulpin: str,
        transaction_id: str,
        event_type: str,
        previous_hash: str,
        payload_hash: str,
        state_after_transition_hash: str,
        signatures: Dict[str, str]
    ) -> str:
        sig_str = json.dumps(signatures, sort_keys=True)
        block_content = (
            f"{index}|{timestamp}|{ulpin}|{transaction_id}|{event_type}|"
            f"{previous_hash}|{payload_hash}|{state_after_transition_hash}|{sig_str}"
        )
        return self._hash_string(block_content)

    def record_event(
        self,
        ulpin: str,
        transaction_id: str,
        event_type: str,
        payload: Dict,
        state_hash_after: str,
        signing_departments: List[str]
    ) -> LedgerBlock:
        """Appends an immutable state transition block to the permissioned ledger."""
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Calculate payload hash
        payload_json = json.dumps(payload, sort_keys=True)
        payload_hash = self._hash_string(payload_json)
        
        # Get previous block hash (global or per-ulpin)
        if not self.chain:
            prev_hash = "0" * 64 # Genesis block
            index = 0
        else:
            prev_hash = self.chain[-1].block_hash
            index = len(self.chain)

        # Generate department digital signatures
        signatures = {}
        for dept in signing_departments:
            signatures[dept] = self.generate_department_signature(dept, payload_hash)

        # Compute block hash
        block_hash = self.calculate_block_hash(
            index=index,
            timestamp=timestamp,
            ulpin=ulpin,
            transaction_id=transaction_id,
            event_type=event_type,
            previous_hash=prev_hash,
            payload_hash=payload_hash,
            state_after_transition_hash=state_hash_after,
            signatures=signatures
        )

        block = LedgerBlock(
            index=index,
            timestamp=timestamp,
            ulpin=ulpin,
            transaction_id=transaction_id,
            event_type=event_type,
            previous_hash=prev_hash,
            payload_hash=payload_hash,
            state_after_transition_hash=state_hash_after,
            department_signatures=signatures,
            block_hash=block_hash
        )

        self.chain.append(block)
        if ulpin not in self.ulpin_indexes:
            self.ulpin_indexes[ulpin] = []
        self.ulpin_indexes[ulpin].append(index)

        return block

    def get_history_for_ulpin(self, ulpin: str) -> List[LedgerBlock]:
        indices = self.ulpin_indexes.get(ulpin, [])
        return [self.chain[i] for i in indices]

    def verify_ledger_integrity(self, ulpin: Optional[str] = None) -> AuditVerificationResult:
        """
        Cryptographically verifies the entire ledger chain.
        Detects tampering, invalid previous_hash pointers, or modified payload contents.
        """
        if not self.chain:
            return AuditVerificationResult(
                ulpin=ulpin or "ALL",
                is_valid=True,
                total_blocks=0,
                verified_blocks=0,
                genesis_timestamp="",
                latest_block_hash="0" * 64,
                audit_notes=["Ledger is currently empty (Genesis state)"]
            )

        notes = []
        for i, block in enumerate(self.chain):
            # Check previous hash linkage
            if i == 0:
                if block.previous_hash != "0" * 64:
                    return AuditVerificationResult(
                        ulpin=ulpin or "GLOBAL",
                        is_valid=False,
                        total_blocks=len(self.chain),
                        verified_blocks=0,
                        genesis_timestamp=self.chain[0].timestamp,
                        latest_block_hash=self.chain[-1].block_hash,
                        tamper_detected_at_block=0,
                        audit_notes=["Genesis block has invalid previous_hash"]
                    )
            else:
                prev_block = self.chain[i - 1]
                if block.previous_hash != prev_block.block_hash:
                    return AuditVerificationResult(
                        ulpin=ulpin or "GLOBAL",
                        is_valid=False,
                        total_blocks=len(self.chain),
                        verified_blocks=i,
                        genesis_timestamp=self.chain[0].timestamp,
                        latest_block_hash=self.chain[-1].block_hash,
                        tamper_detected_at_block=i,
                        audit_notes=[f"Broken hash chain link between Block {i-1} and Block {i}"]
                    )

            # Recompute block hash
            recomputed_hash = self.calculate_block_hash(
                index=block.index,
                timestamp=block.timestamp,
                ulpin=block.ulpin,
                transaction_id=block.transaction_id,
                event_type=block.event_type,
                previous_hash=block.previous_hash,
                payload_hash=block.payload_hash,
                state_after_transition_hash=block.state_after_transition_hash,
                signatures=block.department_signatures
            )

            if recomputed_hash != block.block_hash:
                return AuditVerificationResult(
                    ulpin=ulpin or "GLOBAL",
                    is_valid=False,
                    total_blocks=len(self.chain),
                    verified_blocks=i,
                    genesis_timestamp=self.chain[0].timestamp,
                    latest_block_hash=self.chain[-1].block_hash,
                    tamper_detected_at_block=i,
                    audit_notes=[f"Block {i} hash mismatch: recalculation does not match recorded block hash"]
                )

        notes.append(f"Successfully verified all {len(self.chain)} blocks across all departments.")
        return AuditVerificationResult(
            ulpin=ulpin or "GLOBAL",
            is_valid=True,
            total_blocks=len(self.chain),
            verified_blocks=len(self.chain),
            genesis_timestamp=self.chain[0].timestamp,
            latest_block_hash=self.chain[-1].block_hash,
            tamper_detected_at_block=None,
            audit_notes=notes
        )

# Global singleton ledger instance
ledger = CryptographicLedger()
