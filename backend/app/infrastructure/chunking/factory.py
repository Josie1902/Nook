from transformers import AutoTokenizer
import tiktoken

from docling_core.transforms.chunker.tokenizer.base import BaseTokenizer
from docling_core.transforms.chunker.tokenizer.huggingface import (
    HuggingFaceTokenizer,
)
from docling_core.transforms.chunker.tokenizer.openai import (
    OpenAITokenizer,
)

from app.core.settings import settings


def create_tokenizer() -> BaseTokenizer:
    config = settings.TOKENIZER

    if config.provider == "huggingface":
        return HuggingFaceTokenizer(
            tokenizer=AutoTokenizer.from_pretrained(
                config.hugging_face.tokenizer
            ),
            max_tokens=config.hugging_face.max_tokens,
        )

    if config.provider == "openai":
        return OpenAITokenizer(
            tokenizer=tiktoken.encoding_for_model(
                config.openai.tokenizer
            ),
            max_tokens=config.openai.max_tokens,
        )

    raise ValueError(
        f"Unsupported tokenizer provider: {config.provider}"
    )