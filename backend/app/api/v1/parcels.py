from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.models.parcel import ParcelAsset, PropertyPassport
from app.core.repository import repository

router = APIRouter(prefix="/v1/parcel", tags=["Parcels & Spatial Registry"])

@router.get("s", response_model=List[ParcelAsset])
def list_parcels():
    """Retrieve all cadastral parcel assets."""
    return repository.list_parcels()

@router.get("/{ulpin}", response_model=ParcelAsset)
def get_parcel(ulpin: str):
    """Fetch canonical land parcel asset by ULPIN."""
    parcel = repository.get_parcel(ulpin)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"ULPIN '{ulpin}' not found in registry")
    return parcel

@router.get("/{ulpin}/passport", response_model=PropertyPassport)
def get_property_passport(ulpin: str):
    """
    Standardized machine-readable Property Passport for external consumption.
    Used by citizens, banks, municipal bodies, and developers.
    """
    passport = repository.get_property_passport(ulpin)
    if not passport:
        raise HTTPException(status_code=404, detail=f"Property Passport for ULPIN '{ulpin}' not found")
    return passport

@router.get("/layers/geojson")
def get_cadastral_geojson():
    """Returns a valid GeoJSON FeatureCollection of all parcels for MapLibre/Leaflet."""
    features = []
    for p in repository.list_parcels():
        has_mortgage = any(e.is_active for e in p.encumbrances)
        has_dispute = any(d.injunction_freeze_transfers for d in p.disputes)
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": p.geometry.type,
                "coordinates": p.geometry.coordinates
            },
            "properties": {
                "ulpin": p.ulpin,
                "asset_id": p.asset_id,
                "survey_number": p.spatial.survey_number,
                "area_sq_meters": p.spatial.area_sq_meters,
                "status": p.status.value,
                "owner": p.rights[0].holder_name if p.rights else "UNASSIGNED",
                "land_use": p.zoning.land_use_category,
                "has_mortgage": has_mortgage,
                "has_dispute": has_dispute,
                "version": p.version
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }
