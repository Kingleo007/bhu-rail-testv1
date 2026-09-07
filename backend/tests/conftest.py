import pytest
from app.core.repository import repository

@pytest.fixture(autouse=True)
def clean_repository_state():
    """Ensures each test starts with fresh, isolated cadastral pilot state."""
    repository.reset()
    yield
    repository.reset()
