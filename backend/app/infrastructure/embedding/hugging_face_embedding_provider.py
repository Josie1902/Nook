from typing import List

from sentence_transformers import SentenceTransformer

from app.application.embedding.ports import EmbeddingProvider


class HuggingFaceEmbeddingProvider(EmbeddingProvider):
    def __init__(
        self,
        model: str,
    ):
        self._model = model
        self._client = SentenceTransformer(model)

    @property
    def model(self) -> str:
        return self._model

    @property
    def provider_name(self) -> str:
        return "huggingface"


    def embed(self, texts: List[str]) -> List[List[float]]:
        embeddings = self._client.encode(
            texts,
            normalize_embeddings=True,  # Set `True` for cosine similarity
        )

        return embeddings.tolist()