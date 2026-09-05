from typing import List, Tuple, Optional, Any, Dict
from pydantic import BaseModel, Field

class GeoCoordinates(BaseModel):
    latitude: float
    longitude: float

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] # [ [ [lng, lat], [lng, lat], ... ] ]

class SpatialMetadata(BaseModel):
    crs: str = Field(default="EPSG:4326", description="Coordinate Reference System")
    area_sq_meters: float = Field(..., description="Geodesic polygon area in square meters")
    survey_number: str = Field(..., description="Cadastral survey / Khasra number")
    sub_division_number: Optional[str] = None
    village_code: str
    centroid: List[float] = Field(..., description="[longitude, latitude] center of mass")
    accuracy_meters: float = Field(default=0.05, description="Survey equipment precision accuracy")
    survey_date: str = Field(..., description="ISO 8601 survey timestamp")
