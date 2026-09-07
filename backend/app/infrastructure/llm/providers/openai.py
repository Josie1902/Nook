import json
from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel, ValidationError

from app.core.settings import OpenAIConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.retry import build_retrying
from app.infrastructure.llm.schemas import LLMMessage, LLMResponse

T = TypeVar("T", bound=BaseModel)


class OpenAIClient(BaseLLMClient):
    def __init__(self, config: OpenAIConfig):
        self._client = OpenAI(
            api_key=config.api_key.get_secret_value()
            if config.api_key
            else None,
            base_url=config.base_url,
            max_retries=0,  # Tenacity owns retries
        )

    def _build_kwargs(
        self,
        model: str,
        messages: list[LLMMessage],
        temperature: float,
        timeout: int,
        thinking: bool,
    ) -> dict:
        kwargs = {
            "model": model,
            "messages": [m.model_dump() for m in messages],
            "temperature": temperature,
            "timeout": timeout,
        }

        if thinking:
            kwargs["reasoning_effort"] = "medium"

        return kwargs

    def complete(
        self,
        *,
        model: str,
        messages: list[LLMMessage],
        temperature: float = 0.0,
        timeout: int = 120,
        thinking: bool = False,
        max_retries: int = 3,
    ) -> LLMResponse:
        kwargs = self._build_kwargs(
            model,
            messages,
            temperature,
            timeout,
            thinking,
        )

        for attempt in build_retrying(max_retries):
            with attempt:
                response = self._client.chat.completions.create(
                    **kwargs
                )

                return LLMResponse(
                    content=response.choices[0].message.content or "",
                    model=response.model,
                    raw=response.model_dump(),
                )

        raise RuntimeError("unreachable")

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
    ) -> T:
        kwargs = self._build_kwargs(
            model,
            messages,
            temperature,
            timeout,
            thinking,
        )

        kwargs["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": schema.__name__,
                "schema": schema.model_json_schema(),
                "strict": True,
            },
        }

        for attempt in build_retrying(max_retries):
            with attempt:
                response = self._client.chat.completions.create(
                    **kwargs
                )

                content = response.choices[0].message.content or ""

                try:
                    return schema.model_validate_json(content)
                except (ValidationError, json.JSONDecodeError) as exc:
                    raise ValueError(
                        f"Model returned invalid structured output: {exc}"
                    ) from exc

        raise RuntimeError("unreachable")

    def close(self) -> None:
        self._client.close()