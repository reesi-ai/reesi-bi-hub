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


class HeatmapPoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    weight: float = Field(ge=0)
    name: str
    city: str
    address: str
    search_count: int = Field(ge=0)


class HeatmapMeta(BaseModel):
    trial: str = ""
    total_searches: int = Field(ge=0)
    total_sites: int = Field(ge=0)
    generated: str


class HeatmapDataset(BaseModel):
    meta: HeatmapMeta
    points: list[HeatmapPoint]
