from typing import List, Tuple
from app.models.parcel import ParcelAsset
from app.models.enums import AssetStatus, EncumbranceType, DisputeStatus

class RuleViolation:
    def __init__(self, rule_code: str, message: str, authority: str, reference_id: str):
        self.rule_code = rule_code
        self.message = message
        self.authority = authority
        self.reference_id = reference_id

    def to_dict(self):
        return {
            "rule_code": self.rule_code,
            "message": self.message,
            "authority": self.authority,
            "reference_id": self.reference_id
        }

class LandRuleEngine:
    """
    Pluggable rule engine evaluating legal, regulatory, spatial,
    and institutional policies before any transaction can proceed.
    """
    
    @staticmethod
    def evaluate_transfer_eligibility(parcel: ParcelAsset) -> Tuple[bool, List[RuleViolation]]:
        violations: List[RuleViolation] = []

        # 1. Check Parcel Lifecycle Status
        if parcel.status != AssetStatus.ACTIVE:
            violations.append(RuleViolation(
                rule_code="RULE-LIFECYCLE-INVALID",
                message=f"Parcel status is {parcel.status.value}. Transactions can only be executed on ACTIVE assets.",
                authority="LAND_REVENUE_DEPARTMENT",
                reference_id=parcel.ulpin
            ))

        # 2. Check Court Injunctions / Disputes (KILLER DEMO 1)
        for dispute in parcel.disputes:
            if dispute.status in [DisputeStatus.INJUNCTION_ISSUED, DisputeStatus.UNDER_HEARING, DisputeStatus.FILED]:
                if dispute.injunction_freeze_transfers:
                    violations.append(RuleViolation(
                        rule_code="RULE-JUDICIAL-INJUNCTION-ACTIVE",
                        message=(
                            f"TRANSACTION BLOCKED: Active judicial injunction in Case {dispute.case_number} "
                            f"issued by {dispute.adjudicating_authority}. Petitioner: {dispute.petitioner}."
                        ),
                        authority=dispute.adjudicating_authority,
                        reference_id=dispute.case_number
                    ))

        # 3. Check Active Bank Mortgages / Financial Encumbrances
        for enc in parcel.encumbrances:
            if enc.is_active and enc.type == EncumbranceType.BANK_MORTGAGE:
                amount_str = f"INR {enc.claim_amount_inr:,.2f}" if enc.claim_amount_inr else "Unspecified Amount"
                violations.append(RuleViolation(
                    rule_code="RULE-FINANCIAL-ENCUMBRANCE-ACTIVE",
                    message=(
                        f"TRANSACTION BLOCKED: Active first-charge mortgage registered with {enc.institution_name} "
                        f"for {amount_str} (Ref: {enc.reference_document_no}). NOC / Discharge Deed required."
                    ),
                    authority=enc.institution_name,
                    reference_id=enc.encumbrance_id
                ))

        # 4. Check Statutory Acquisition Notices
        if parcel.zoning.is_acquisition_zone:
            violations.append(RuleViolation(
                rule_code="RULE-PUBLIC-ACQUISITION-FREEZE",
                message="TRANSACTION BLOCKED: Parcel is notified under Section 4 Land Acquisition Act for public infrastructure.",
                authority="URBAN_DEVELOPMENT_AUTHORITY",
                reference_id=parcel.ulpin
            ))

        is_eligible = len(violations) == 0
        return is_eligible, violations

    @staticmethod
    def evaluate_mortgage_eligibility(parcel: ParcelAsset) -> Tuple[bool, List[RuleViolation]]:
        violations: List[RuleViolation] = []

        if parcel.status != AssetStatus.ACTIVE:
            violations.append(RuleViolation(
                rule_code="RULE-LIFECYCLE-INVALID",
                message=f"Parcel status is {parcel.status.value}. Mortgage cannot be created on non-ACTIVE asset.",
                authority="LAND_REVENUE_DEPARTMENT",
                reference_id=parcel.ulpin
            ))

        for dispute in parcel.disputes:
            if dispute.status in [DisputeStatus.INJUNCTION_ISSUED, DisputeStatus.UNDER_HEARING]:
                if dispute.injunction_freeze_mortgage:
                    violations.append(RuleViolation(
                        rule_code="RULE-JUDICIAL-INJUNCTION-MORTGAGE",
                        message=(
                            f"MORTGAGE BLOCKED: Judicial stay in Case {dispute.case_number} "
                            f"by {dispute.adjudicating_authority} prohibits creating financial encumbrance."
                        ),
                        authority=dispute.adjudicating_authority,
                        reference_id=dispute.case_number
                    ))

        return len(violations) == 0, violations

rule_engine = LandRuleEngine()
