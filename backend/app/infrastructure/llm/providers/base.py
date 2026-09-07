from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel

from app.core.settings import StageConfig
from app.infrastructure.llm.schemas import LLMMessage, LLMResponse

T = TypeVar("T", bound=BaseModel)


class BaseLLMClient(ABC):
    """One instance per process, shared across all stages."""

    @abstractmethod
    def complete(
        self,
        *,
        model: str,
        messages: list[LLMMessage],
        temperature: float = 0.0,
        timeout: int = 120,
        thinking: bool = False,
        max_retries: int = 3,
    ) -> LLMResponse: ...

    @abstractmethod
    def complete_structured(
        self,
        *,
        model: str,
        messages: list[LLMMessage],
        schema: type[T],
        temperature: float = 0.0,
        timeout: int = 120,
        thinking: bool = False,
        max_retries: int = 3,
    ) -> T: ...

    def run_stage(
        self, stage: StageConfig, messages: list[LLMMessage]
    ) -> LLMResponse:
        return self.complete(
            model=stage.model,
            messages=messages,
            temperature=stage.temperature,
            timeout=stage.timeout_seconds,
            thinking=stage.thinking,
            max_retries=stage.max_retries,
        )

    def run_stage_structured(
        self, stage: StageConfig, messages: list[LLMMessage], schema: type[T]
    ) -> T:
        return self.complete_structured(
            model=stage.model,
            messages=messages,
            schema=schema,
            temperature=stage.temperature,
            timeout=stage.timeout_seconds,
            thinking=stage.thinking,
            max_retries=stage.max_retries,
        )

    def aclose(self) -> None:
        return None