from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models.parcel import ParcelAsset

class StateCadastreAdapter(ABC):
    """
    Abstract interface for State Land Administration Systems.
    Converts legacy state-specific formats into the canonical Bhu-Rail Parcel DPI model.
    """
    
    @abstractmethod
    def get_state_code(self) -> str:
        pass

    @abstractmethod
    def transform_to_canonical(self, raw_state_record: Dict[str, Any]) -> ParcelAsset:
        pass
