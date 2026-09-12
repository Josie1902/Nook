import tiktoken
from transformers import AutoTokenizer

from docling_core.transforms.chunker.tokenizer.base import BaseTokenizer
from docling_core.transforms.chunker.tokenizer.huggingface import (
    HuggingFaceTokenizer,
)
from docling_core.transforms.chunker.tokenizer.openai import (
    OpenAITokenizer,
)
from app.core.settings import settings


def _resolve_embedding_model() -> str:
    config = settings.EMBEDDING

    if config.provider == "huggingface":
        return config.hugging_face.model

    if config.provider == "openai":
        return config.openai.model

    raise ValueError(f"Unsupported embedding provider: {config.provider}")

def create_embedding_tokenizer() -> BaseTokenizer:
    config = settings.EMBEDDING
    tokenizer_config = settings.TOKENIZER
    model_name = _resolve_embedding_model()

    if config.provider == "huggingface":
        return HuggingFaceTokenizer(
            tokenizer=AutoTokenizer.from_pretrained(model_name),
            max_tokens=tokenizer_config.hugging_face.max_tokens,
        )

    if config.provider == "openai":
        return OpenAITokenizer(
            tokenizer=tiktoken.encoding_for_model(model_name),
            max_tokens=tokenizer_config.openai.max_tokens,
        )

    raise ValueError(f"Unsupported embedding provider: {config.provider}")
