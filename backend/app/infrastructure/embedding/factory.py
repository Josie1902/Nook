from app.application.embedding.ports import EmbeddingProvider
from app.core.settings import settings
from app.infrastructure.embedding.hugging_face_embedding_provider import (
    HuggingFaceEmbeddingProvider,
)
from app.infrastructure.embedding.open_ai_embedding_provider import (
    OpenAIEmbeddingProvider,
)


def create_embedding_provider() -> EmbeddingProvider:
    config = settings.EMBEDDING

    if config.provider == "huggingface":
        return HuggingFaceEmbeddingProvider(
            model=config.hugging_face.model,
        )

    if config.provider == "openai":
        return OpenAIEmbeddingProvider(
            api_key=(
                config.openai.api_key.get_secret_value()
                if config.openai.api_key
                else None
            ),
            model=config.openai.model,
        )

    raise ValueError(f"Unsupported embedding provider: {config.provider}")

