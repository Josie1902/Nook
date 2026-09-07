from app.core.settings import LLMConfig, settings
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.providers.ollama import OllamaClient
from app.infrastructure.llm.providers.openai import OpenAIClient


def get_llm_client() -> BaseLLMClient:
    config: LLMConfig = settings.LLM
    if config.provider == "openai":
        return OpenAIClient(config.openai)
    return OllamaClient(config.ollama)