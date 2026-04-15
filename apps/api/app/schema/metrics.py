"""
Normalized data schema — mirrors packages/shared/src/schema.ts.

Every adapter returns data validated against these models. When the TS
shared types change, update this file in the same PR.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

IsoMonth = str  # "YYYY-MM"


class MonthlyMetric(BaseModel):
    month: IsoMonth
    value: float


class CumulativeMetric(BaseModel):
    month: IsoMonth
    monthly: float
    cumulative: float


class SponsorRef(BaseModel):
    sponsor_id: str
    sponsor_name: str


class StudyRef(BaseModel):
    study_id: str
    study_name: str
    sponsor_id: str


class TrialClicks(BaseModel):
    study_id: str
    study_name: str
    sponsor_id: str
    month: IsoMonth
    clicks: int = Field(ge=0)


class UserTypeDistribution(BaseModel):
    user_type: str
    count: int = Field(ge=0)


class IndicationMetric(BaseModel):
    indication: str
    month: IsoMonth
    value: float
