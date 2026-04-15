from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: Literal["dev", "staging", "prod"] = "dev"

    # Data source selection
    data_source: Literal["bubble", "supabase"] = "bubble"

    # Bubble
    bubble_api_base_url: str = ""
    bubble_api_token: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
