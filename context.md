# 🇮🇳 Bhu-Rail (भू-रेल): Architectural Blueprint & Technical Context

> **"We are not building a Land Management App. We are building a Land Digital Public Infrastructure (DPI) that other applications, government departments, banks, courts, registries, municipal bodies, and citizens can plug into."**

---

## Table of Contents
1. [The Foundational Philosophy: Land as DPI ("Land UPI")](#1-the-foundational-philosophy-land-as-dpi-land-upi)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [The Canonical Land Asset Model](#3-the-canonical-land-asset-model)
4. [The Bundle of Rights Abstraction](#4-the-bundle-of-rights-abstraction)
5. [Transaction Lifecycle & State Machine](#5-transaction-lifecycle--state-machine)
6. [The Pluggable Rule Engine](#6-the-pluggable-rule-engine)
7. [Cryptographic Trust & Permissioned Ledger Layer](#7-cryptographic-trust--permissioned-ledger-layer)
8. [OGC Spatial Engine & Subdivision Protocol](#8-ogc-spatial-engine--subdivision-protocol)
9. [State Cadastre Adaptation Layer](#9-state-cadastre-adaptation-layer)
10. [The 3 Killer Hackathon Demonstrations](#10-the-3-killer-hackathon-demonstrations)
11. [Complete Technology Stack](#11-complete-technology-stack)
12. [Open API Specification & Data Dictionary](#12-open-api-specification--data-dictionary)
13. [Security, RBAC, and Privacy Principles](#13-security-rbac-and-privacy-principles)
14. [Local Testing, Hosting & Operational Guide](#14-local-testing-hosting--operational-guide)

---

## 1. The Foundational Philosophy: Land as DPI ("Land UPI")

India's land administration is historically crippled by institutional silos:
* **Revenue Department** maintains Records of Rights (Jamabandi / RoR / RTC).
* **Sub-Registrar (Registration Dept)** executes sale deeds and stamps deeds.
* **Survey Department** maintains cadastral boundary maps (Nakshas / Musavi).
* **Revenue Courts & Civil Courts** issue stays, attachments, and resolve succession disputes.
* **Commercial Banks** require title search reports (TSR) from lawyers taking 3–4 weeks.
* **Municipal Urban Local Bodies (ULBs)** issue building permissions and property tax IDs.

Because these databases do not communicate synchronously, fraudulent dual registrations, sales of court-stayed lands, illegal encroachments, and unrecorded mortgage pledges cost the Indian economy an estimated **0.5% to 1.3% of GDP annually** in stalled litigation and disputed titles.

### The Paradigm Shift
Bhu-Rail introduces an interoperable **rail protocol** (analogous to NPCI's UPI for payments or Beckn for mobility):
* **UPI Principle:** Banks retain user accounts, but NPCI defines the standardized payment rail and machine-readable protocols (`@upi`).
* **Bhu-Rail Principle:** States retain their land governance records, but Bhu-Rail defines the canonical digital parcel asset rail (`ULPIN`), exposing standardized machine-readable endpoints (`/v1/parcel/{ulpin}/passport` and `/v1/verification/title-status`).

```text
                  PAYMENTS (UPI)                     LAND (BHU-RAIL DPI)
             ┌─────────────────────┐               ┌─────────────────────┐
             │    Bank Account     │               │     Land Parcel     │
             └──────────┬──────────┘               └──────────┬──────────┘
                        │                                     │
             ┌──────────▼──────────┐               ┌──────────▼──────────┐
             │      UPI Rail       │               │    Bhu-Rail Rail    │
             └──────────┬──────────┘               └──────────┬──────────┘
                        │                                     │
      ┌─────────────────┼─────────────────┐ ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼ ▼                 ▼                 ▼
PhonePe / GPay    HDFC / SBI          Merchant  Citizen App    Bank Collateral   Sub-Registrar
```

---

## 2. End-to-End System Architecture

```text
                               ┌──────────────────────────────────────────────────────────┐
                               │                    CONSUMING CLIENTS                     │
                               │                                                          │
                               │  Citizen Portal   Bank Credit Engine   Court Registrar   │
                               │  Surveyor GIS     Municipal ULB        FinTech Lending   │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                                                  RESTful HTTPS / GeoJSON
                                                            │
                               ┌────────────────────────────▼─────────────────────────────┐
                               │                 BHU-RAIL OPEN API RAIL                   │
                               │                                                          │
                               │  • /v1/parcel/{ulpin}/passport (Machine-Readable Contract)│
                               │  • /v1/verification/title-status (Instant Land UPI)      │
                               │  • /v1/transaction/transfer    (Atomic Mutation Request) │
                               │  • /v1/parcel/subdivide        (Spatial Partitioning)    │
                               │  • /v1/dispute/file            (Court Stay Injunction)   │
                               │  • /v1/ledger/verify/audit     (Cryptographic Audit)     │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                     ┌──────────────────────────────────────┼──────────────────────────────────────┐
                     │                                      │                                      │
       ┌─────────────▼─────────────┐          ┌─────────────▼─────────────┐          ┌─────────────▼─────────────┐
       │   LAND ASSET CORE & DB    │          │    PLUGGABLE RULE ENGINE  │          │   TRANSACTION WORKFLOW    │
       │                           │          │                           │          │   & PROPERTY LOCK MGR     │
       │ Canonical Parcel Entities │          │ Injunction Interceptor    │          │ State Machine:            │
       │ Bundle of Rights Models   │          │ Mortgage Encumbrance Rule │          │ VERIFIED -> LOCKED ->     │
       │ Encumbrances & Disputes   │          │ Area Conservation Rule    │          │ RULES -> SIGNED -> COMMIT │
       └─────────────┬─────────────┘          └───────────────────────────┘          └─────────────┬─────────────┘
                     │                                                                             │
                     └──────────────────────────────────────┬──────────────────────────────────────┘
                                                            │
                                              ┌─────────────▼─────────────┐
                                              │   CRYPTOGRAPHIC LEDGER    │
                                              │   (TRUST / AUDIT LAYER)   │
                                              │                           │
                                              │ • SHA-256 Merkle Chaining │
                                              │ • Department PKI Sigs     │
                                              │ • Tamper Detection Engine │
                                              └─────────────┬─────────────┘
                                                            │
                                              ┌─────────────▼─────────────┐
                                              │    STATE ADAPTER LAYER    │
                                              │                           │
                                              │ • Haryana Jamabandi/HALRIS│
                                              │ • Karnataka Bhoomi RTC    │
                                              │ • Telangana Dharani Portal│
                                              └───────────────────────────┘
```

---

## 3. The Canonical Land Asset Model

Rather than storing a land parcel as a flat relational row (`ulpin, owner_name`), Bhu-Rail represents every parcel as a multi-dimensional digital asset:

```text
                                      LAND ASSET
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         │                   │                     │                   │
    [IDENTITY]          [GEOMETRY]              [RIGHTS]         [ENCUMBRANCES]
         │                   │                     │                   │
      • ULPIN             • Polygon Coordinates • Freehold Owner     • Bank Mortgage
      • Asset ID          • Centroid            • Share Fraction     • Revenue Tax Lien
      • State/District    • Area in m²          • Lessee / Tenant    • Statutory Notice
      • Version Number    • Precision (cm)      • Easement Right     • Court Stay
         │                   │                     │                   │
         └───────────────────┼─────────────────────┴───────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
      [LINEAGE TREE]                  [TRUST INTEGRITY]
            │                                 │
      • Parent ULPINs                   • SHA-256 State Hash
      • Subdivided Children             • Ledger Root Hash
      • Genealogy Depth                 • Multi-Dept Signatures
```

### The Standardized Property Passport
External consumers receive a standardized JSON response:
```json
{
  "ulpin": "IN-HR-GGM-KDP-0101-0000",
  "asset_id": "AST-HR-KDP-101",
  "version": 1,
  "status": "ACTIVE",
  "title_verified": true,
  "active_mortgage_count": 0,
  "active_court_stay": false,
  "tax_status_clear": true,
  "land_use": "RESIDENTIAL",
  "building_permission_eligible": true,
  "area_sq_meters": 1850.4,
  "current_owners": ["Suresh Chandra Yadav"],
  "encumbrances": [],
  "active_disputes": [],
  "lineage": {
    "parent_ulpins": [],
    "child_ulpins": []
  },
  "ledger_root_hash": "c8a49ff2000f2e5196bc54dd546a36d2673bf82744883f3e6a0d240ca8871861",
  "last_state_transition": "CADASTRAL_GENESIS_SURVEY",
  "tamper_verified": true
}
```

---

## 4. The Bundle of Rights Abstraction

Land in Indian jurisprudence is never merely "Owner = X". Multiple parties hold simultaneous legal rights over the same spatial polygon.

Bhu-Rail formally models this as a **Bundle of Rights**:

| Right Type | Description | Example Holder |
| :--- | :--- | :--- |
| `FREEHOLD_OWNERSHIP` | Absolute title and alienation right | Citizen / Patta Holder |
| `POSSESSION` | Physical occupancy right (Kashtkar) | Tenant farmer / Cultivator |
| `LEASEHOLD` | Contractual lease with fixed expiration | Industrial Lessee (99-yr lease) |
| `MORTGAGE_LIEN` | Financial hypothecation / equitable charge | State Bank of India |
| `EASEMENT` | Right of way / drainage across parcel | Neighboring plot owner |
| `GOVERNMENT_GRANT` | Subsidized land subject to sale lock | Beneficiary under welfare scheme |

Each right maintains:
* `right_id`: Unique identifier (e.g. `RT-HR-KDP-101-01`).
* `holder_name`: Legal name of the individual or entity.
* `holder_identity_hash`: SHA-256 hash of Aadhaar/PAN/CIN. This prevents public scraping of citizen identity while allowing cryptographic verification.
* `share_fraction`: Fractional co-ownership (`1/1`, `1/2`, `3/8`).
* `is_active`: Boolean status toggled on transfer or release.

---

## 5. Transaction Lifecycle & State Machine

Transactions on Bhu-Rail are **atomic, deterministic, and immutable**. No single department can arbitrarily modify ownership without passing through the state machine.

### State Transition Diagram
```text
  [ ACTIVE ]
      │
      │ 1. Initiate Transfer Request
      ▼
  [ PROPERTY_LOCKED ] ◄── Concurrency Lock Manager acquires mutex
      │
      │ 2. Rule Engine Verification
      ├─── FAIL ──► [ REJECTED ] ──► Release Lock ──► Emit Audit Log
      │
      │ 3. PASS Rule Checks
      ▼
  [ VALIDATED ]
      │
      │ 4. Sub-Registrar & Revenue Department Digital Signing
      ▼
  [ APPROVED ]
      │
      │ 5. SHA-256 Block Appended to Cryptographic Ledger
      ▼
  [ COMMITTED ]
      │
      │ 6. Increment Parcel Version, Mutate Rights Array, Release Lock
      ▼
  [ ACTIVE (vN+1) ]
```

### Concurrency Control (Double-Sale Prevention)
In legacy registries, an unscrupulous seller can sign a sale deed in Sub-Registrar Office A at 10:00 AM, and another sale deed in Sub-Registrar Office B at 11:30 AM before paper mutation records update.

In Bhu-Rail:
1. When a transaction starts, `lock_manager.acquire_lock(ulpin, tx_id)` sets an atomic lock.
2. Any concurrent transfer, subdivision, or mortgage request on the same ULPIN receives `HTTP 409 Conflict / Lock Rejected`.
3. The lock is only released when the transaction either commits to the ledger or terminates in an explicit rejection.

---

## 6. The Pluggable Rule Engine

Government policies, statutory land ceiling limits, and judicial orders must not be hardcoded as ad-hoc `if` statements inside UI controllers.

Bhu-Rail provides a declarative, pluggable **Land Rule Engine** (`backend/app/rules/engine.py`):

```python
class LandRuleEngine:
    @staticmethod
    def evaluate_transfer_eligibility(parcel: ParcelAsset) -> Tuple[bool, List[RuleViolation]]:
        # Rule 1: Asset Lifecycle Validity
        if parcel.status != AssetStatus.ACTIVE:
            ...
        # Rule 2: Active Judicial Injunctions (Court Stays)
        for dispute in parcel.disputes:
            if dispute.injunction_freeze_transfers:
                ...
        # Rule 3: Active Financial Liens (Bank Mortgages without NOC)
        for enc in parcel.encumbrances:
            if enc.is_active and enc.type == EncumbranceType.BANK_MORTGAGE:
                ...
        # Rule 4: Statutory Land Acquisition Buffers
        if parcel.zoning.is_acquisition_zone:
            ...
```

---

## 7. Cryptographic Trust & Permissioned Ledger Layer

A common critique of blockchain in land records is: *"Why put huge satellite images, 50-page deeds, and GIS coordinate arrays on a slow blockchain?"*

Bhu-Rail implements the **pragmatic hybrid architecture**:
1. **Relational / GIS Store:** Holds current asset state, polygons, and spatial indexes for high-speed queries.
2. **Permissioned Ledger:** Stores only **hashes, state transition events, timestamps, and multi-departmental digital signatures**.

### Block Architecture
Every block contains:
```text
Block_N = {
  "index": N,
  "timestamp": "2026-09-06T13:14:35Z",
  "ulpin": "IN-HR-GGM-KDP-0104-0000",
  "transaction_id": "TX-TRF-98A1B2C3",
  "event_type": "OWNERSHIP_TRANSFER_COMPLETED",
  "previous_hash": Block_{N-1}["block_hash"],
  "payload_hash": SHA256(TransactionPayload),
  "state_after_transition_hash": SHA256(ParcelState),
  "department_signatures": {
    "SUB_REGISTRAR": "SIG_SUB_98df817291a0b3c1",
    "REVENUE_DEPARTMENT": "SIG_REV_a3f4e19098bc2110"
  },
  "block_hash": SHA256(index + timestamp + ulpin + prev_hash + payload_hash + ...)
}
```

### Tamper-Evidence Verification
Calling `GET /v1/ledger/verify/audit` recomputes every block hash from Genesis (Block 0) to Tip. If a malicious system administrator directly updates the database to change an owner name or alter a polygon boundary:
* The recalculated block hash will not match the recorded block hash.
* The audit engine flags:
  ```json
  {
    "is_valid": false,
    "tamper_detected_at_block": 0,
    "audit_notes": ["Block 0 hash mismatch: recalculation does not match recorded block hash"]
  }
  ```

---

## 8. OGC Spatial Engine & Subdivision Protocol

Land is inherently spatial. When land is divided among heirs or sold in parts:
1. **Never overwrite historical geometry.**
2. **Strictly enforce area conservation:**
   $$\sum_{i=1}^{k} \text{Area}(\text{Child}_i) = \text{Area}(\text{Parent}) \pm \epsilon$$
3. **Preserve bidirectional genealogy lineage:**
   * Parent record records its child ULPINs and status changes to `SUBDIVIDED`.
   * Child records store their parent ULPIN in `lineage.parent_ulpins`.

### Geodesic Projection Math
WGS84 coordinates (Latitude/Longitude degrees) cannot be treated as planar Euclidean space. Bhu-Rail calculates geodesic area scaled to meters using center-latitude scaling:
$$\Delta x = (\text{lng} - \text{origin\_lng}) \times (111,320 \times \cos(\text{avg\_lat}))$$
$$\Delta y = (\text{lat} - \text{origin\_lat}) \times 111,320$$

---

## 9. State Cadastre Adaptation Layer

India has 28 states and 8 union territories, each with distinct naming conventions and land recording systems:
* **Haryana:** Murabba, Khasra, Khewat, Khatauni (Jamabandi / HALRIS).
* **Karnataka:** Survey Number, Hissa, Surnoc, RTC (Bhoomi).
* **Telangana:** Khata, Survey No, Passbook (Dharani).
* **Uttar Pradesh:** Gata, Fasli Year, Khatauni (Bhulekh).

Bhu-Rail does **not** force any state to discard their legacy systems. Instead, it defines an abstract adapter interface:

```python
class StateCadastreAdapter(ABC):
    @abstractmethod
    def get_state_code(self) -> str: ...
    
    @abstractmethod
    def transform_to_canonical(self, raw_state_record: Dict[str, Any]) -> ParcelAsset: ...
```

The `HaryanaJamabandiAdapter` automatically normalizes `murabba_no` and `khasra_no` into:
$$\text{ULPIN} = \text{IN-HR-GGM-KDP-}\{murabba\text{.zfill(4)}\}\text{-}\{khasra\text{.zfill(4)}\}$$

---

## 10. The 3 Killer Hackathon Demonstrations

### Killer Demo #1: Fraud Prevention via Judicial Injunction Freeze
* **The Problem:** Litigants frequently sell disputed land to unsuspecting third parties while court stay petitions are pending in revenue tribunals.
* **The Demo Flow:**
  1. Open the **Fraud Prevention Console** (`/court-registry`).
  2. Inspect Plot 104 (`IN-HR-GGM-KDP-0104-0000`), which has an active stay in Revenue Court Case `REV/COURT/SOHNA/2024/771`.
  3. Attempt to register a transfer to a buyer for ₹75,00,000.
  4. The Rule Engine intercepts the request in 4ms, acquires a lock, identifies the injunction, rolls back the transaction, and returns:
     ```text
     ╔══════════════════════════════════════════════════════════════════╗
     ║                    TRANSACTION BLOCKED                           ║
     ╠══════════════════════════════════════════════════════════════════╣
     ║ ACTIVE JUDICIAL INJUNCTION                                       ║
     ║ Case Number: REV/COURT/SOHNA/2024/771                            ║
     ║ Authority: Court of Sub-Divisional Magistrate Sohna              ║
     ║ Injunction: Status Quo Ordered on Northern Boundary              ║
     ╚══════════════════════════════════════════════════════════════════╝
     ```
  5. The console also allows injecting an injunction onto Plot 101 to demonstrate real-time freezing across all external banking and registration APIs.

### Killer Demo #2: Real-Time Spatial Parcel Subdivision & Lineage
* **The Problem:** Subdivisions are notoriously plagued by mysterious encroachments, missing genealogy links, and paper-based miscalculations where total split areas exceed original survey bounds.
* **The Demo Flow:**
  1. Open the **Surveyor Tools Console** (`/surveyor-tools`).
  2. Select large agricultural plot `Plot 108` ($10,000+\text{ m}^2$).
  3. Assign child partitions to two heirs (Balwant Singh Elder Son & Younger Son).
  4. Click **Execute Spatial Subdivision**.
  5. The Spatial Engine bisects the WGS84 polygon, verifies area conservation, creates two new child assets (`Plot 10801` and `Plot 10802`), retires the parent to `SUBDIVIDED`, and anchors the event to the cryptographic ledger signed by the Survey Department.

### Killer Demo #3: "Land UPI" 1-Click Collateral Verification
* **The Problem:** When applying for a mortgage or agricultural loan, banks take 3–4 weeks conducting manual title searches across registry, revenue, and court records.
* **The Demo Flow:**
  1. Open the **Third-Party Bank Simulator** (`/bank-simulator`).
  2. Enter ULPIN `IN-HR-GGM-KDP-0101-0000`.
  3. Click **Verify via Land UPI**.
  4. In **sub-80 milliseconds**, the endpoint returns:
     * `owner_verified: true`
     * `active_mortgage: false`
     * `active_court_restriction: false`
     * `transferrable: true`
     * `ledger_audit_status: "VERIFIED_TAMPER_FREE"`
  5. The bank instantly knows collateral title is clean and marketable without manual paperwork.

---

## 11. Complete Technology Stack

| Layer | Component | Technologies Used | Why Chosen |
| :--- | :--- | :--- | :--- |
| **API Rail & Backend** | Core Engine | Python 3.14, FastAPI, Uvicorn | High asynchronous throughput, native geospatial math integration, automatic OpenAPI generation |
| **Validation & Schema** | Canonical Contracts | Pydantic v2 | Strict type-safety, fast JSON serialization, validation error propagation |
| **Spatial Analytics** | Geometry Engine | Shapely 2.1, GeoJSON, WGS84 | Industrial standard for 2D computational geometry, polygon intersections, and bisecting algorithms |
| **Trust & Ledger** | Audit Chain | SHA-256, Merkle Hashing, PKI Digital Signatures | Immutable auditability, tamper detection, department cryptographic non-repudiation |
| **Frontend Console** | Reference UI | Next.js 14.2 (App Router), TypeScript, Tailwind CSS | Production-grade React ecosystem, server and client components, fast static generation |
| **Vector Cadastre** | Cadastral Visualization | SVG Geodesic Vector Engine, Leaflet | High-precision coordinate projection from WGS84 (EPSG:4326) without third-party proprietary dependencies |
| **Icons & Design** | User Interface | Lucide React, Tailwind UI typography | Polished, clean, high-density government portal aesthetics |
| **Testing Suite** | Automated Tests | Pytest 9.1, HTTPX, FastAPI TestClient | Sub-second execution of all killer demo integration tests |

---

## 12. Open API Specification & Data Dictionary

| Method | Endpoint | Summary | Primary Consumer |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Rail Health & Endpoint Registry | Public / System Monitoring |
| `GET` | `/v1/parcels` | List all canonical cadastral parcel assets | Survey & GIS Applications |
| `GET` | `/v1/parcel/{ulpin}` | Fetch complete canonical asset record | Government Nodes |
| `GET` | `/v1/parcel/{ulpin}/passport` | Get standardized machine-readable Property Passport | Citizens, Developers, Municipalities |
| `GET` | `/v1/parcel/layers/geojson` | Fetch cadastral vector FeatureCollection with status styles | GIS Mapping Tools, MapLibre, Leaflet |
| `GET` | `/v1/verification/title-status` | Instant 1-click Title Verification ("Land UPI") | Commercial Banks, NBFCs, FinTechs |
| `POST` | `/v1/transaction/transfer` | Ownership transfer with atomic lock & rule evaluation | Sub-Registrar Office, Citizen Portal |
| `POST` | `/v1/parcel/subdivide` | Partition parcel geometry and update lineage | Licensed Cadastral Surveyors |
| `POST` | `/v1/dispute/file` | Register judicial stay or boundary litigation | Revenue Courts, Civil Courts |
| `GET` | `/v1/ledger/{ulpin}/history` | Retrieve chronological state transition blocks | Auditing Authorities, Legal Counsel |
| `GET` | `/v1/ledger/blocks` | Stream recent global ledger blocks | Ledger Transparency Monitors |
| `GET` | `/v1/ledger/verify/audit` | Cryptographically verify SHA-256 hash chain from Genesis | Independent Compliance Auditors |

---

## 13. Security, RBAC, and Privacy Principles

1. **Aadhaar Privacy (No Raw PII on Chain):**
   * Raw Aadhaar or PAN numbers are never stored in the clear.
   * `holder_identity_hash = SHA256(Aadhaar_Salt)` allows zero-knowledge proof verification without exposing citizen identification.
2. **Role-Based Access Control (RBAC):**
   * **Bank Node:** Permitted to call `/v1/verification/title-status` and submit mortgage charges. Prohibited from mutating freehold ownership.
   * **Sub-Registrar Node:** Permitted to execute transfers subject to Rule Engine clearance.
   * **Revenue Court Node:** Permitted to inject and resolve judicial disputes.
   * **Surveyor Node:** Permitted to propose subdivisions subject to Revenue Officer approval.
3. **Decoupling Citizen Identity from Land Identity:**
   * A citizen does not have to expose their total portfolio of land holdings to a bank inspecting one specific parcel.
   * The verification rail answers the specific question: *"Is this specific parcel free of encumbrance?"* rather than disclosing unrelated assets.

---

## 14. Local Testing, Hosting & Operational Guide

### Starting the Live Rail & Console

Both servers can be started simultaneously:
```bash
./start.sh
```

Or individually:

```bash
# 1. Start FastAPI Land DPI Rail
./backend/.venv/bin/uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000

# 2. Start Next.js Frontend Console
npm --prefix frontend run dev -- -p 3000
```

### URLs for Testing
* **DPI Explorer Console:** [http://localhost:3000](http://localhost:3000)
* **Killer Demo 1 (Fraud Prevention):** [http://localhost:3000/court-registry](http://localhost:3000/court-registry)
* **Killer Demo 2 (Subdivision):** [http://localhost:3000/surveyor-tools](http://localhost:3000/surveyor-tools)
* **Killer Demo 3 (Land UPI Bank):** [http://localhost:3000/bank-simulator](http://localhost:3000/bank-simulator)
* **Trust Ledger Inspector:** [http://localhost:3000/ledger](http://localhost:3000/ledger)
* **FastAPI Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Executing the Test Suite
```bash
PYTHONPATH=backend ./backend/.venv/bin/pytest backend/tests/ -v
```
All 6 tests verify root health, Land UPI appraisal, court stay fraud interception, polygon subdivision area conservation, ledger block verification, and malicious tamper detection.
