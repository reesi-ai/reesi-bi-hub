"""
Data adapter interface — the contract every data source must implement.

This is the ONLY way business logic and routers access data. When we switch
from Bubble to Supabase, only the concrete implementation changes; every
consumer keeps working unchanged.

See AGENTS.md → Core Principles → Data Adapter Pattern.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.schema import (
    CumulativeMetric,
    IndicationMetric,
    MonthlyMetric,
    SponsorRef,
    StudyRef,
    TrialClicks,
    UserTypeDistribution,
)


@runtime_checkable
class DataSource(Protocol):
    """Every data adapter (Bubble, Supabase, ...) implements this protocol."""

    async def get_sponsors(self) -> list[SponsorRef]: ...

    async def get_studies(self, sponsor_id: str | None = None) -> list[StudyRef]: ...

    async def get_user_signups(self) -> list[CumulativeMetric]: ...

    async def get_user_type_distribution(self) -> list[UserTypeDistribution]: ...

    async def get_searches_total(self) -> list[MonthlyMetric]: ...

    async def get_trial_clicks_total(self) -> list[CumulativeMetric]: ...

    async def get_clicks_per_trial(
        self,
        sponsor_id: str | None = None,
        study_ids: list[str] | None = None,
    ) -> list[TrialClicks]: ...

    async def get_logins(self) -> list[CumulativeMetric]: ...

    async def get_searches_by_indication(self) -> list[IndicationMetric]: ...
