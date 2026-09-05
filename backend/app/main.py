from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.parcels import router as parcels_router
from app.api.v1.verification import router as verification_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.ledger import router as ledger_router

app = FastAPI(
    title="Bhu-Rail: Land Digital Public Infrastructure (DPI)",
    description=(
        "Universal parcel-centric Digital Public Infrastructure exposing standardized open APIs "
        "('Land UPI') for identity, geometry, rights, encumbrances, and lifecycle governance."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend and 3rd party consumer apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(parcels_router)
app.include_router(verification_router)
app.include_router(transactions_router)
app.include_router(ledger_router)

@app.get("/")
def root():
    return {
        "platform": "Bhu-Rail (Land Digital Public Infrastructure)",
        "status": "OPERATIONAL",
        "standard": "ULPIN-Centric Canonical Land Model v1",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "property_passport": "/v1/parcel/{ulpin}/passport",
            "land_upi_verification": "/v1/verification/title-status?ulpin={ulpin}",
            "transfer_transaction": "/v1/transaction/transfer",
            "subdivision": "/v1/parcel/subdivide",
            "cadastral_geojson": "/v1/parcel/layers/geojson",
            "ledger_audit": "/v1/ledger/verify/audit"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
