from typing import Literal, Optional

from pydantic import BaseModel, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class OpenAIConfig(BaseModel):
    api_key: SecretStr | None = None
    base_url: str = "https://api.openai.com/v1"


class OllamaConfig(BaseModel):
    base_url: str = "http://localhost:11434"


class StageConfig(BaseModel):
    model: str
    temperature: float = 0.0
    thinking: bool = False
    timeout_seconds: int = 120
    max_retries: int = 3


class LLMConfig(BaseModel):
    provider: Literal["openai", "ollama"] = "ollama"

    openai: OpenAIConfig
    ollama: OllamaConfig

    metadata: StageConfig


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_nested_delimiter="__",
        extra="ignore",
    )

    BETTER_AUTH_SECRET: str

    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    S3_ENDPOINT_URL: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET: str
    S3_REGION: str = "us-east-1"

    MAX_PDF_SIZE_MB: int = 20

    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    PROCESS_CONFIG_VERSION: str

    LLM: LLMConfig

    GOOGLE_BOOKS_API_KEY: Optional[str] = None

    @property
    def max_pdf_size_bytes(self) -> int:
        return self.MAX_PDF_SIZE_MB * 1024 * 1024


settings = Settings()