from pydantic import BaseModel, Field, ValidationError

from app.application.metadata_extraction.ports import (
    BookIdentityResolver,
    PdfMetadata,
)
from app.core.settings import StageConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.schemas import LLMMessage


class BookIdentity(BaseModel):
    """Schema for the LLM's structured response — validated before we trust it."""

    title: str | None = Field(default=None)
    author: str | None = Field(default=None)
    isbn: str | None = Field(default=None)


class LLMBookIdentityResolver(BookIdentityResolver):
    """
    Provider-agnostic: works against whichever BaseLLMClient it's given
    (OpenAIClient or OllamaClient). Provider selection lives entirely in
    config.LLM.provider + the factory — this class never branches on it.
    """

    def __init__(self, llm_client: BaseLLMClient, stage_config: StageConfig):
        self._client = llm_client
        self._stage_config = stage_config

    def resolve(
        self,
        filename: str,
        pdf_metadata: PdfMetadata,
        first_pages_text: str,
    ) -> PdfMetadata:
        messages = [
            LLMMessage(
            role="user",
            content=(
                "Extract the book metadata from the evidence below.\n\n"
                "Return JSON with exactly: title, author, isbn. "
                "Each value must be a string or null.\n\n"
                "Rules:\n"
                "- Use only the provided evidence.\n"
                "- Prefer explicit evidence over inference; never guess.\n"
                "- If evidence is insufficient, use null.\n"
                "- ISBN must be returned exactly as found; do not convert ISBN-10/13.\n"
                "- If sources conflict, prefer this order:\n"
                "  1. First pages text\n"
                "  2. PDF metadata\n"
                "  3. Filename\n"
                "- When sources agree, prefer the matching value.\n\n"
                "Evidence:\n"
                f"Filename: {filename}\n"
                f"PDF title: {pdf_metadata.title}\n"
                f"PDF author: {pdf_metadata.author}\n"
                f"PDF ISBN: {pdf_metadata.isbn}\n"
                f"First pages:\n{first_pages_text[:2000]}"
            ),
            )
        ]

        try:
            result = self._client.run_stage_structured(
                self._stage_config,
                messages=messages,
                schema=BookIdentity,
            )
        except (ValidationError, ValueError):
            # Retries exhausted and the model still didn't return
            # schema-conforming JSON — fall back to existing metadata.
            return pdf_metadata

        return PdfMetadata(
            title=result.title or pdf_metadata.title,
            author=result.author or pdf_metadata.author,
            isbn=result.isbn or pdf_metadata.isbn,
        )