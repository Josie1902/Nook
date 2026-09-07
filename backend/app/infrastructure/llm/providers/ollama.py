import json
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.settings import OllamaConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.retry import build_retrying
from app.infrastructure.llm.schemas import LLMMessage, LLMResponse

T = TypeVar("T", bound=BaseModel)


class OllamaClient(BaseLLMClient):
    def __init__(self, config: OllamaConfig):
        self._base_url = config.base_url.rstrip("/")
        self._http = httpx.Client(base_url=self._base_url)

    def _build_payload(
        self,
        model: str,
        messages: list[LLMMessage],
        temperature: float,
        thinking: bool,
    ) -> dict:
        payload: dict = {
            "model": model,
            "messages": [m.model_dump() for m in messages],
            "stream": False,
            "options": {
                "temperature": temperature,
            },
        }

        if thinking:
            payload["think"] = True

        return payload

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
        payload = self._build_payload(
            model,
            messages,
            temperature,
            thinking,
        )

        for attempt in build_retrying(max_retries):
            with attempt:
                resp = self._http.post(
                    "/api/chat",
                    json=payload,
                    timeout=timeout,
                )
                resp.raise_for_status()

                data = resp.json()

                return LLMResponse(
                    content=data["message"]["content"],
                    model=data.get("model", model),
                    raw=data,
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
        payload = self._build_payload(
            model,
            messages,
            temperature,
            thinking,
        )

        payload["format"] = schema.model_json_schema()

        for attempt in build_retrying(max_retries):
            with attempt:
                resp = self._http.post(
                    "/api/chat",
                    json=payload,
                    timeout=timeout,
                )
                resp.raise_for_status()

                data = resp.json()
                content = data["message"]["content"]

                try:
                    return schema.model_validate_json(content)
                except (ValidationError, json.JSONDecodeError) as exc:
                    raise ValueError(
                        f"Model returned invalid structured output: {exc}"
                    ) from exc

        raise RuntimeError("unreachable")

    def close(self) -> None:
        self._http.close()