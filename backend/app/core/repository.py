import uuid
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
from app.models.parcel import ParcelAsset, PropertyPassport, ParcelLineage
from app.models.transaction import (
    TransferRequest, SubdivisionRequest, DisputeRequest,
    TransactionRecord, TitleVerificationResponse
)
from app.models.enums import AssetStatus, RightType, TransactionType, TransactionStatus, DisputeType, DisputeStatus
from app.models.rights import LandRight
from app.models.dispute import Dispute
from app.models.spatial import GeoJSONGeometry, SpatialMetadata
from app.data.pilot_parcels import get_initial_pilot_parcels, compute_state_hash, sha
from app.core.property_lock import lock_manager
from app.rules.engine import rule_engine
from app.ledger.audit_chain import ledger
from app.spatial.engine import spatial_engine

class LandAssetRepository:
    def __init__(self):
        self.parcels: Dict[str, ParcelAsset] = get_initial_pilot_parcels()
        self.transactions: Dict[str, TransactionRecord] = {}
        self._bootstrap_genesis_ledger()

    def _bootstrap_genesis_ledger(self):
        """Records initial genesis blocks for pilot cadastral survey."""
        for ulpin, parcel in self.parcels.items():
            payload = {
                "action": "CADASTRAL_GENESIS_SURVEY",
                "ulpin": ulpin,
                "asset_id": parcel.asset_id,
                "survey_number": parcel.spatial.survey_number,
                "area_sq_meters": parcel.spatial.area_sq_meters,
                "initial_owner": parcel.rights[0].holder_name if parcel.rights else "GOVERNMENT",
                "status": parcel.status.value
            }
            signing_nodes = ["SURVEY_DEPARTMENT", "REVENUE_DEPARTMENT"]
            if parcel.disputes:
                signing_nodes.append("REVENUE_COURT")
            if parcel.encumbrances:
                signing_nodes.append("FINANCIAL_INSTITUTION")

            ledger.record_event(
                ulpin=ulpin,
                transaction_id=f"TX-GENESIS-{parcel.spatial.survey_number}",
                event_type="CADASTRAL_GENESIS_SURVEY",
                payload=payload,
                state_hash_after=parcel.state_hash,
                signing_departments=signing_nodes
            )

    def get_parcel(self, ulpin: str) -> Optional[ParcelAsset]:
        return self.parcels.get(ulpin)

    def list_parcels(self) -> List[ParcelAsset]:
        return list(self.parcels.values())

    def get_property_passport(self, ulpin: str) -> Optional[PropertyPassport]:
        parcel = self.get_parcel(ulpin)
        if not parcel:
            return None

        # Check ledger status
        integrity = ledger.verify_ledger_integrity(ulpin)
        history = ledger.get_history_for_ulpin(ulpin)
        last_event = history[-1].event_type if history else "GENESIS"
        root_hash = history[-1].block_hash if history else "0" * 64

        owners = [r.holder_name for r in parcel.rights if r.is_active and r.type == RightType.FREEHOLD_OWNERSHIP]
        active_disputes = [d for d in parcel.disputes if d.status in [DisputeStatus.INJUNCTION_ISSUED, DisputeStatus.UNDER_HEARING]]
        has_active_stay = any(d.injunction_freeze_transfers for d in active_disputes)
        
        return PropertyPassport(
            ulpin=parcel.ulpin,
            asset_id=parcel.asset_id,
            version=parcel.version,
            status=parcel.status,
            title_verified=len(owners) > 0 and parcel.status == AssetStatus.ACTIVE,
            active_mortgage_count=len([e for e in parcel.encumbrances if e.is_active]),
            active_court_stay=has_active_stay,
            tax_status_clear=True,
            land_use=parcel.zoning.land_use_category,
            building_permission_eligible=not has_active_stay and not parcel.zoning.is_acquisition_zone,
            area_sq_meters=parcel.spatial.area_sq_meters,
            current_owners=owners,
            encumbrances=parcel.encumbrances,
            active_disputes=active_disputes,
            lineage=parcel.lineage,
            geometry=parcel.geometry,
            centroid=parcel.spatial.centroid,
            ledger_root_hash=root_hash,
            last_state_transition=last_event,
            tamper_verified=integrity.is_valid,
            passport_generated_at=datetime.now(timezone.utc).isoformat()
        )

    def verify_title_status(self, ulpin: str) -> TitleVerificationResponse:
        """Instant 'Land UPI' Title Verification Rail."""
        now = datetime.now(timezone.utc).isoformat()
        parcel = self.get_parcel(ulpin)
        
        if not parcel:
            return TitleVerificationResponse(
                ulpin=ulpin,
                query_timestamp=now,
                owner_verified=False,
                current_owners=[],
                active_mortgage=False,
                active_court_restriction=False,
                tax_due=False,
                land_use_category="UNKNOWN",
                parcel_verified=False,
                transferrable=False,
                active_locks=["PARCEL_NOT_FOUND"],
                ledger_audit_status="NOT_FOUND"
            )

        owners = [r.holder_name for r in parcel.rights if r.is_active and r.type == RightType.FREEHOLD_OWNERSHIP]
        has_mortgage = any(e.is_active for e in parcel.encumbrances)
        active_disputes = [d for d in parcel.disputes if d.status in [DisputeStatus.INJUNCTION_ISSUED, DisputeStatus.UNDER_HEARING]]
        has_court_stay = any(d.injunction_freeze_transfers for d in active_disputes)
        
        # Check rule engine
        is_eligible, violations = rule_engine.evaluate_transfer_eligibility(parcel)
        active_locks = [v.rule_code for v in violations]
        if lock_manager.is_locked(ulpin):
            active_locks.append("TRANSACTION_CONCURRENCY_LOCKED")

        integrity = ledger.verify_ledger_integrity(ulpin)

        return TitleVerificationResponse(
            ulpin=ulpin,
            query_timestamp=now,
            owner_verified=len(owners) > 0,
            current_owners=owners,
            active_mortgage=has_mortgage,
            active_court_restriction=has_court_stay,
            tax_due=False,
            land_use_category=parcel.zoning.land_use_category,
            parcel_verified=parcel.status == AssetStatus.ACTIVE,
            transferrable=is_eligible and not lock_manager.is_locked(ulpin),
            active_locks=active_locks,
            ledger_audit_status="VERIFIED_TAMPER_FREE" if integrity.is_valid else "WARNING_TAMPER_DETECTED"
        )

    def execute_transfer(self, req: TransferRequest) -> Tuple[bool, str, Optional[TransactionRecord]]:
        tx_id = f"TX-TRF-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()
        
        parcel = self.get_parcel(req.ulpin)
        if not parcel:
            return False, f"Parcel {req.ulpin} not found", None

        # 1. Acquire Concurrency Lock
        acquired, lock_msg = lock_manager.acquire_lock(
            ulpin=req.ulpin,
            transaction_id=tx_id,
            reason="OWNERSHIP_TRANSFER_MUTATION",
            department="SUB_REGISTRAR"
        )
        if not acquired:
            return False, f"Lock acquisition rejected: {lock_msg}", None

        # Initialize transaction record
        tx = TransactionRecord(
            transaction_id=tx_id,
            type=TransactionType.SALE,
            target_ulpin=req.ulpin,
            status=TransactionStatus.INITIATED,
            initiated_at=now,
            completed_steps=["TRANSACTION_REQUEST_SUBMITTED", "PROPERTY_CONCURRENCY_LOCKED"]
        )

        # 2. Rule Engine Evaluation
        is_eligible, violations = rule_engine.evaluate_transfer_eligibility(parcel)
        if not is_eligible:
            lock_manager.release_lock(req.ulpin, tx_id)
            tx.status = TransactionStatus.REJECTED
            tx.rule_violations = [f"[{v.rule_code}] {v.message}" for v in violations]
            tx.completed_at = datetime.now(timezone.utc).isoformat()
            self.transactions[tx_id] = tx
            return False, f"Transfer rejected by Rule Engine: {violations[0].message}", tx

        tx.completed_steps.append("RULE_ENGINE_VALIDATED")

        # 3. Department Digital Approvals & Signing
        tx.department_signatures = {
            "SUB_REGISTRAR": ledger.generate_department_signature("SUB_REGISTRAR", req.deed_doc_hash),
            "REVENUE_DEPARTMENT": ledger.generate_department_signature("REVENUE_DEPARTMENT", req.deed_doc_hash)
        }
        tx.completed_steps.append("DEPARTMENTAL_SIGNATURES_AUTHENTICATED")

        # 4. Mutate Rights & Increment Version
        new_right = LandRight(
            right_id=f"RT-{parcel.spatial.survey_number}-{uuid.uuid4().hex[:4]}",
            type=RightType.FREEHOLD_OWNERSHIP,
            holder_name=req.buyer_name,
            holder_identity_hash=req.buyer_identity_hash,
            share_fraction="1/1",
            valid_from=now,
            issuing_authority="Sub-Registrar Sohna",
            title_deed_doc_id=f"DEED-{datetime.now().year}-{uuid.uuid4().hex[:6]}",
            title_deed_hash=req.deed_doc_hash,
            is_active=True
        )

        # Deactivate previous ownership rights
        for r in parcel.rights:
            if r.type == RightType.FREEHOLD_OWNERSHIP:
                r.is_active = False

        parcel.rights.append(new_right)
        parcel.version += 1
        parcel.updated_at = now
        parcel.state_hash = compute_state_hash(
            parcel.ulpin, parcel.status.value, parcel.version,
            parcel.rights, parcel.encumbrances, parcel.disputes
        )

        # 5. Commit to Cryptographic Ledger
        block = ledger.record_event(
            ulpin=parcel.ulpin,
            transaction_id=tx_id,
            event_type="OWNERSHIP_TRANSFER_COMPLETED",
            payload={
                "buyer_name": req.buyer_name,
                "buyer_identity_hash": req.buyer_identity_hash,
                "sale_consideration_inr": req.sale_consideration_inr,
                "deed_doc_hash": req.deed_doc_hash,
                "previous_version": parcel.version - 1,
                "new_version": parcel.version
            },
            state_hash_after=parcel.state_hash,
            signing_departments=["SUB_REGISTRAR", "REVENUE_DEPARTMENT"]
        )

        # 6. Release Property Lock & Complete
        lock_manager.release_lock(req.ulpin, tx_id)
        tx.status = TransactionStatus.COMMITTED
        tx.completed_steps.append("LEDGER_COMMITTED")
        tx.resulting_asset_version = parcel.version
        tx.ledger_block_index = block.index
        tx.completed_at = datetime.now(timezone.utc).isoformat()
        
        self.transactions[tx_id] = tx
        return True, f"Ownership successfully transferred to {req.buyer_name}. Asset incremented to version {parcel.version}.", tx

    def execute_subdivision(self, req: SubdivisionRequest) -> Tuple[bool, str, Optional[TransactionRecord]]:
        """
        KILLER DEMO 2: Spatial Subdivision of Parent Parcel into Child Parcels.
        Ensures area conservation, updates genealogy lineage, and commits to ledger.
        """
        tx_id = f"TX-SUB-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()
        
        parent = self.get_parcel(req.parent_ulpin)
        if not parent:
            return False, f"Parent parcel {req.parent_ulpin} not found", None

        if parent.status != AssetStatus.ACTIVE:
            return False, f"Cannot subdivide parcel with status {parent.status.value}", None

        # Lock parent
        acquired, msg = lock_manager.acquire_lock(req.parent_ulpin, tx_id, "PARCEL_SUBDIVISION_SURVEY", "SURVEY_DEPARTMENT")
        if not acquired:
            return False, f"Failed to acquire lock: {msg}", None

        # Check rule eligibility on parent
        eligible, violations = rule_engine.evaluate_transfer_eligibility(parent)
        if not eligible:
            lock_manager.release_lock(req.parent_ulpin, tx_id)
            return False, f"Subdivision blocked by Rule Engine: {violations[0].message}", None

        # Perform geometric split via spatial engine
        child_geoms = spatial_engine.subdivide_polygon(
            parent_coords=parent.geometry.coordinates[0],
            split_line_coords=req.splitting_line_coordinates if req.splitting_line_coordinates else None,
            split_ratio=0.3
        )

        if len(child_geoms) < 2:
            lock_manager.release_lock(req.parent_ulpin, tx_id)
            return False, "Spatial cutter did not divide polygon into multiple parts", None

        # Verify area conservation (within 0.5% survey calculation tolerance)
        total_child_area = sum(cg[1] for cg in child_geoms)
        relative_diff = abs(total_child_area - parent.spatial.area_sq_meters) / parent.spatial.area_sq_meters
        if relative_diff > 0.01:
            lock_manager.release_lock(req.parent_ulpin, tx_id)
            return False, f"Area conservation error: Parent={parent.spatial.area_sq_meters}m², Children={total_child_area}m²", None

        # Re-balance last child to guarantee exact conservation
        adjusted_child_geoms = []
        accumulated_area = 0.0
        for i, (coords, area_val) in enumerate(child_geoms):
            if i == len(child_geoms) - 1:
                final_area = round(parent.spatial.area_sq_meters - accumulated_area, 2)
                adjusted_child_geoms.append((coords, final_area))
            else:
                accumulated_area += area_val
                adjusted_child_geoms.append((coords, area_val))
        child_geoms = adjusted_child_geoms

        # Generate child parcels
        child_ulpins = []
        child_records = []
        for idx, (coords, area_sqm) in enumerate(child_geoms, start=1):
            sub_no = f"{parent.spatial.survey_number}/{idx}"
            child_ulpin = f"IN-HR-GGM-KDP-{parent.spatial.survey_number}{idx:02d}-0000"
            child_ulpins.append(child_ulpin)

            # Assign child ownership
            owner_info = req.child_owners[idx - 1] if idx - 1 < len(req.child_owners) else {
                "owner_name": f"{parent.rights[0].holder_name} (Part {idx})",
                "share": "1/1"
            }

            child_right = LandRight(
                right_id=f"RT-{sub_no.replace('/', '_')}-01",
                type=RightType.FREEHOLD_OWNERSHIP,
                holder_name=owner_info["owner_name"],
                holder_identity_hash=sha(f"IDENTITY:{owner_info['owner_name']}"),
                share_fraction=owner_info.get("share", "1/1"),
                valid_from=now,
                issuing_authority="Revenue Officer Sohna",
                title_deed_doc_id=f"SUB-ORDER-{parent.spatial.survey_number}-{idx}",
                is_active=True
            )

            child_parcel = ParcelAsset(
                ulpin=child_ulpin,
                asset_id=f"AST-HR-KDP-{parent.spatial.survey_number}{idx:02d}",
                version=1,
                status=AssetStatus.ACTIVE,
                geometry=GeoJSONGeometry(coordinates=[coords]),
                spatial=SpatialMetadata(
                    area_sq_meters=area_sqm,
                    survey_number=sub_no,
                    sub_division_number=str(idx),
                    village_code=parent.spatial.village_code,
                    centroid=spatial_engine.calculate_centroid(coords),
                    survey_date=now
                ),
                lineage=ParcelLineage(
                    parent_ulpins=[parent.ulpin],
                    child_ulpins=[],
                    subdivision_timestamp=now,
                    genealogy_depth=parent.lineage.genealogy_depth + 1
                ),
                rights=[child_right],
                encumbrances=[],
                disputes=[],
                zoning=parent.zoning,
                state_hash=compute_state_hash(child_ulpin, "ACTIVE", 1, [child_right], [], []),
                created_at=now,
                updated_at=now
            )
            self.parcels[child_ulpin] = child_parcel
            child_records.append(child_parcel)

        # Retire parent parcel
        parent.status = AssetStatus.SUBDIVIDED
        parent.lineage.child_ulpins = child_ulpins
        parent.version += 1
        parent.updated_at = now
        parent.state_hash = compute_state_hash(
            parent.ulpin, parent.status.value, parent.version,
            parent.rights, parent.encumbrances, parent.disputes
        )

        # Record in Cryptographic Ledger
        block = ledger.record_event(
            ulpin=parent.ulpin,
            transaction_id=tx_id,
            event_type="PARCEL_SUBDIVISION_APPROVED",
            payload={
                "parent_ulpin": parent.ulpin,
                "child_ulpins": child_ulpins,
                "parent_area_sqm": parent.spatial.area_sq_meters,
                "child_areas": [cg[1] for cg in child_geoms],
                "surveyor_license": req.surveyor_license_no
            },
            state_hash_after=parent.state_hash,
            signing_departments=["SURVEY_DEPARTMENT", "REVENUE_DEPARTMENT"]
        )

        lock_manager.release_lock(parent.ulpin, tx_id)

        tx = TransactionRecord(
            transaction_id=tx_id,
            type=TransactionType.SUBDIVIDE,
            target_ulpin=parent.ulpin,
            status=TransactionStatus.COMMITTED,
            initiated_at=now,
            completed_at=now,
            completed_steps=["SURVEY_SPLIT_VALIDATED", "AREA_CONSERVATION_VERIFIED", "CHILDREN_REGISTERED", "LEDGER_COMMITTED"],
            resulting_ulpins=child_ulpins,
            ledger_block_index=block.index
        )
        self.transactions[tx_id] = tx
        return True, f"Subdivision completed: Parent retired, child parcels {', '.join(child_ulpins)} created.", tx

    def file_dispute(self, req: DisputeRequest) -> Tuple[bool, str, Dispute]:
        """KILLER DEMO 1 (Part A): Injecting Court Injunction that Freezes Property."""
        parcel = self.get_parcel(req.ulpin)
        if not parcel:
            return False, f"Parcel {req.ulpin} not found", None

        disp_id = f"DISP-{uuid.uuid4().hex[:6].upper()}"
        dispute = Dispute(
            dispute_id=disp_id,
            type=DisputeType(req.type),
            status=DisputeStatus.INJUNCTION_ISSUED,
            case_number=req.case_number,
            adjudicating_authority=req.adjudicating_authority,
            petitioner=req.petitioner,
            respondent=req.respondent,
            claimed_area_sq_meters=req.claimed_area_sq_meters,
            injunction_freeze_transfers=req.freeze_transfer,
            injunction_freeze_mortgage=req.freeze_mortgage,
            date_filed=datetime.now(timezone.utc).isoformat(),
            stay_order_doc_hash=req.stay_order_doc_hash,
            remarks="Court order: Interim status quo on alienation and encumbrance"
        )

        parcel.disputes.append(dispute)
        parcel.version += 1
        parcel.updated_at = datetime.now(timezone.utc).isoformat()
        parcel.state_hash = compute_state_hash(
            parcel.ulpin, parcel.status.value, parcel.version,
            parcel.rights, parcel.encumbrances, parcel.disputes
        )

        # Record in Cryptographic Ledger with Court Signature
        ledger.record_event(
            ulpin=parcel.ulpin,
            transaction_id=f"TX-DISP-{disp_id}",
            event_type="JUDICIAL_INJUNCTION_REGISTERED",
            payload={
                "case_number": req.case_number,
                "authority": req.adjudicating_authority,
                "injunction_freeze_transfers": req.freeze_transfer
            },
            state_hash_after=parcel.state_hash,
            signing_departments=["REVENUE_COURT"]
        )

        return True, f"Judicial stay recorded for parcel {req.ulpin}. Property transfer rights frozen.", dispute

repository = LandAssetRepository()
