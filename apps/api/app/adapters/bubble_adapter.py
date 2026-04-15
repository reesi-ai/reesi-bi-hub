"""Bubble data adapter — primary source for all current metrics."""

from __future__ import annotations

import httpx

from app.config import Settings
from app.schema import (
    CumulativeMetric,
    HeatmapDataset,
    IndicationMetric,
    MonthlyMetric,
    SponsorRef,
    StudyRef,
    TrialClicks,
    UserTypeDistribution,
)


class BubbleAdapter:
    """Reads from Bubble's Data API, normalizes to the shared schema.

    TODO: Implement actual Bubble endpoints once API access + field mapping
    are confirmed (Phase 2 gate in PLAN.md).
    """

    def __init__(self, settings: Settings) -> None:
        self._base_url = settings.bubble_api_base_url
        self._token = settings.bubble_api_token
        self._client: httpx.AsyncClient | None = None

    async def _http(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self._base_url,
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=30.0,
            )
        return self._client

    async def aclose(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def get_sponsors(self) -> list[SponsorRef]:
        raise NotImplementedError

    async def get_studies(self, sponsor_id: str | None = None) -> list[StudyRef]:
        raise NotImplementedError

    async def get_user_signups(self) -> list[CumulativeMetric]:
        raise NotImplementedError

    async def get_user_type_distribution(self) -> list[UserTypeDistribution]:
        raise NotImplementedError

    async def get_searches_total(self) -> list[MonthlyMetric]:
        raise NotImplementedError

    async def get_trial_clicks_total(self) -> list[CumulativeMetric]:
        raise NotImplementedError

    async def get_clicks_per_trial(
        self,
        sponsor_id: str | None = None,
        study_ids: list[str] | None = None,
    ) -> list[TrialClicks]:
        raise NotImplementedError

    async def get_logins(self) -> list[CumulativeMetric]:
        raise NotImplementedError

    async def get_searches_by_indication(self) -> list[IndicationMetric]:
        raise NotImplementedError

    async def get_regional_distribution(
        self,
        sponsor_id: str | None = None,
        study_ids: list[str] | None = None,
    ) -> HeatmapDataset:
        raise NotImplementedError
