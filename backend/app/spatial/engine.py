import math
from typing import List, Tuple, Dict, Any, Optional
from shapely.geometry import Polygon, LineString, MultiPolygon, Point
from shapely.ops import split
import geojson

class SpatialEngine:
    """
    OGC-compatible spatial operations and subdivision geometry engine.
    """
    
    # 1 degree of latitude is ~111,000 meters.
    # At latitude ~28.45 (Gurugram), 1 degree of longitude is ~111,000 * cos(28.45 deg) = ~97,600 meters.
    LAT_METERS = 111320.0

    @classmethod
    def _lng_meters(cls, lat: float) -> float:
        return cls.LAT_METERS * math.cos(math.radians(lat))

    @classmethod
    def calculate_polygon_area_sq_meters(cls, coords: List[List[float]]) -> float:
        """
        Computes accurate projected ground area in square meters for WGS84 coordinates.
        coords is [[lng, lat], [lng, lat], ...]
        """
        if len(coords) < 3:
            return 0.0
        
        # Center latitude for scale projection
        avg_lat = sum(p[1] for p in coords) / len(coords)
        lng_scale = cls._lng_meters(avg_lat)
        
        # Project to local meter coordinates
        origin_lng, origin_lat = coords[0][0], coords[0][1]
        projected = [
            ((p[0] - origin_lng) * lng_scale, (p[1] - origin_lat) * cls.LAT_METERS)
            for p in coords
        ]
        
        poly = Polygon(projected)
        return round(float(poly.area), 2)

    @classmethod
    def calculate_centroid(cls, coords: List[List[float]]) -> List[float]:
        poly = Polygon(coords)
        c = poly.centroid
        return [round(c.x, 6), round(c.y, 6)]

    @classmethod
    def check_intersection(cls, coords1: List[List[float]], coords2: List[List[float]]) -> bool:
        p1 = Polygon(coords1)
        p2 = Polygon(coords2)
        return p1.intersects(p2)

    @classmethod
    def subdivide_polygon(
        cls,
        parent_coords: List[List[float]],
        split_line_coords: Optional[List[List[float]]] = None,
        split_ratio: float = 0.3
    ) -> List[Tuple[List[List[float]], float]]:
        """
        Performs geometric parcel subdivision.
        If split_line_coords is provided, cuts polygon along that line.
        Otherwise, cuts polygon along an intelligent bisecting line matching the requested ratio.
        Returns: [ (child1_coords, child1_area_sqm), (child2_coords, child2_area_sqm) ]
        """
        parent_poly = Polygon(parent_coords)
        minx, miny, maxx, maxy = parent_poly.bounds
        
        if split_line_coords and len(split_line_coords) >= 2:
            cutter = LineString(split_line_coords)
        else:
            # Generate vertical cutting line according to ratio
            cut_x = minx + (maxx - minx) * split_ratio
            cutter = LineString([(cut_x, miny - 0.001), (cut_x, maxy + 0.001)])

        result = split(parent_poly, cutter)
        
        child_polys = []
        if hasattr(result, "geoms"):
            child_polys = list(result.geoms)
        else:
            child_polys = [result]

        # If cutter didn't split into multiple geometries, fallback to horizontal cut
        if len(child_polys) < 2:
            cut_y = miny + (maxy - miny) * split_ratio
            cutter_h = LineString([(minx - 0.001, cut_y), (maxx + 0.001, cut_y)])
            res_h = split(parent_poly, cutter_h)
            if hasattr(res_h, "geoms"):
                child_polys = list(res_h.geoms)
            else:
                child_polys = [res_h]

        output = []
        for p in child_polys:
            if isinstance(p, Polygon):
                ext_coords = [[round(x, 6), round(y, 6)] for x, y in list(p.exterior.coords)]
                area = cls.calculate_polygon_area_sq_meters(ext_coords)
                output.append((ext_coords, area))

        return output

spatial_engine = SpatialEngine()
