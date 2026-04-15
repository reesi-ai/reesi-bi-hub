from app.adapters import DataSource
from app.adapters.bubble_adapter import BubbleAdapter
from app.config import Settings


def test_bubble_adapter_satisfies_protocol() -> None:
    """Enforces the adapter contract at test-time.

    If this fails, BubbleAdapter is missing a method required by DataSource.
    """
    adapter = BubbleAdapter(Settings(bubble_api_base_url="", bubble_api_token=""))
    assert isinstance(adapter, DataSource)
