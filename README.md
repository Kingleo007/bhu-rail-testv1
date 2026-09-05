# 🇮🇳 Bhu-Rail (भू-रेल)
### Land Digital Public Infrastructure (DPI) for India

> *"We are not building a Land Management App. We are building a Land Digital Public Infrastructure (DPI) that other apps, government departments, banks, courts, registries, and citizens can plug into."*

---

## 🏛️ The Core Paradigm: Land UPI

| Traditional Land Portals (Silos) | Bhu-Rail: Land DPI Rail |
| :--- | :--- |
| Fragmented State DBs (Jamabandi, Bhoomi, Dharani) | Canonical Digital Land Asset Model |
| Isolated PDF RoRs & Sale Deeds | Machine-readable **Property Passport** & Open APIs |
| Manual clearance from 5 departments | **1-Click Land UPI Title Verification** for Banks & FinTechs |
| Paper-based court stays easily hidden | Instant cryptographic **Injunction Locks** blocking transfers |
| Overwriting spatial records on subdivision | Immutable **Spatial Lineage** with area conservation |
| Database admins can silently alter records | **Permissioned SHA-256 Merkle Ledger** with dept signatures |

```text
                    ┌─────────────────────────────┐
                    │      APPLICATIONS            │
                    │                             │
                    │ Citizen App / Bank / Court  │
                    │ Registrar / Municipal / AI  │
                    └──────────────┬──────────────┘
                                   │
                              OPEN APIs
                                   │
                    ┌──────────────▼──────────────┐
                    │       LAND DPI RAIL         │
                    │                             │
                    │ Parcel API                  │
                    │ Ownership API               │
                    │ Rights API                  │
                    │ Transfer API                │
                    │ Mortgage API                │
                    │ Dispute API                 │
                    │ Spatial API                 │
                    │ Verification API (Land UPI) │
                    └──────────────┬──────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
      ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
      │ LAND ASSET  │       │ RULE ENGINE │       │ WORKFLOW    │
      │    CORE     │       │             │       │   ENGINE    │
      └──────┬──────┘       └─────────────┘       └─────────────┘
             │
             ▼
      TRUST / LEDGER LAYER (Tamper-Evident SHA-256 Audit Chain)
             │
             ▼
     STATE ADAPTER NODES (Haryana Jamabandi, Karnataka Bhoomi, etc.)
```

---

## ⚡ 3 Killer Demonstrations Built-in

### 1. 🛡️ Fraud Prevention via Judicial Injunction Lock
* **Scenario:** Seller attempts to register a sale deed on a parcel that has an active court injunction (`IN-HR-GGM-KDP-0104-0000`).
* **Result:** The Bhu-Rail Rule Engine immediately intercepts and cryptographically rejects the transfer with `RULE-JUDICIAL-INJUNCTION-ACTIVE`, citing Case `REV/COURT/SOHNA/2024/771` issued by the Revenue Court.

### 2. 📐 Real-Time Spatial Parcel Subdivision & Lineage
* **Scenario:** A large 10,000 m² agricultural plot (`IN-HR-GGM-KDP-0108-0000`) is partitioned among heirs.
* **Result:** The Spatial Engine cuts the polygon, enforces area conservation ($\sum \text{Area}_{child} = \text{Area}_{parent}$), generates child ULPINs, retires the parent asset to `SUBDIVIDED`, and registers an immutable genealogy event in the ledger.

### 3. 💳 "Land UPI" 1-Click Collateral Verification
* **Scenario:** A bank loan officer or fintech platform needs to verify title status before underwriting a home loan.
* **Result:** Calling `GET /v1/verification/title-status?ulpin=...` returns clean, instantaneous boolean verification flags (`owner_verified`, `active_mortgage`, `active_court_restriction`, `transferrable`) in sub-80ms.

---

## 🚀 Quickstart

### 1. Backend (FastAPI Core Rail)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run test suite
pytest tests/ -v

# Start development server
uvicorn app.main:app --reload --port 8000
```

Interactive API documentation available at `http://localhost:8000/docs`.

### 2. Frontend (DPI Explorer & Simulator Consoles)

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 Core API Specification

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/parcel/{ulpin}/passport` | Machine-readable standardized Property Passport |
| `GET` | `/v1/verification/title-status` | Instant 1-click Title Verification rail for Banks |
| `GET` | `/v1/parcel/layers/geojson` | Live Cadastral GeoJSON layer with status styling |
| `POST` | `/v1/transaction/transfer` | Ownership transfer with concurrency lock & rule check |
| `POST` | `/v1/parcel/subdivide` | Geometric parcel split with parent-child lineage |
| `POST` | `/v1/dispute/file` | Judicial dispute registration & transfer freeze |
| `GET` | `/v1/ledger/{ulpin}/history` | Cryptographic state transition audit blocks |
| `GET` | `/v1/ledger/verify/audit` | SHA-256 hash-chain verification & tamper check |
