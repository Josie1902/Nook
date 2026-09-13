from typing import List

from openai import OpenAI

from app.application.embedding.ports import EmbeddingProvider


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str | None, model: str):
        self._client = OpenAI(api_key=api_key)
        self._model = model

    @property
    def model(self) -> str:
        return self._model

    @property
    def provider_name(self) -> str:
        return "openai"

    def embed(self, texts: List[str]) -> List[List[float]]:
        response = self._client.embeddings.create(
            model=self._model, input=texts
        )
        return [item.embedding for item in response.data]