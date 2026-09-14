from pydantic import BaseModel, Field

from app.application.generation.ports import (
    AnswerGenerator,
    ContextChunk,
    GeneratedAnswer,
)
from app.core.settings import StageConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.schemas import LLMMessage


class GeneratedAnswerResponse(BaseModel):
    """Schema for the LLM's structured response — validated before we trust it."""

    answer: str = Field(...)
    source_chunk_ids: list[str] = Field(default_factory=list)


class LLMAnswerGenerator(AnswerGenerator):
    """
    Provider-agnostic answer generator.

    Works against whichever BaseLLMClient it is given.
    Provider selection lives in config/factory.
    """

    def __init__(
        self,
        llm_client: BaseLLMClient,
        stage_config: StageConfig,
    ):
        self._client = llm_client
        self._stage_config = stage_config

    def generate(
        self,
        question: str,
        context_chunks: list[ContextChunk],
    ) -> GeneratedAnswer:
        context = "\n\n".join(
            (
                f"[Source: {chunk.chunk_id}]\n"
                f"Book: {chunk.book_title}\n"
                f"{chunk.content}"
            )
            for chunk in context_chunks
        )

        messages = [
            LLMMessage(
                role="user",
                content=(
                    "Answer the question using only the provided book evidence.\n\n"
                    "Return a JSON object with exactly these fields:\n"
                    "- answer: string\n"
                    "- source_chunk_ids: list of source chunk IDs\n\n"

                    "Citation rules:\n"
                    "- Every factual claim in the answer must be supported by the provided evidence.\n"
                    "- Cite supporting evidence inline immediately after the relevant claim.\n"
                    "- Citations must use exactly this format: (Book Title, p. N)\n"
                    "- For evidence spanning multiple pages, use: (Book Title, pp. N-M)\n"
                    "- Use the exact book title provided in the evidence.\n"
                    "- Use the page number or page range provided by the source chunk.\n"
                    "- Do not invent, modify, abbreviate, or guess book titles or page numbers.\n"
                    "- If multiple sources support the same claim, include multiple citations, "
                    "for example: (Book A, p. 10) (Book B, p. 25).\n"
                    "- Place citations directly after the claim they support.\n"
                    "- Do not add a separate Sources or References section.\n\n"

                    "Answering rules:\n"
                    "- Use only information explicitly supported by the provided book evidence.\n"
                    "- Do not use outside knowledge.\n"
                    "- Do not make assumptions beyond the evidence.\n"
                    "- If the evidence is insufficient to answer the question, say exactly: "
                    "\"There is not enough information in the provided books.\"\n"
                    "- Do not guess or fill gaps using outside knowledge.\n"
                    "- source_chunk_ids must contain only IDs from the provided evidence.\n"
                    "- Include every source chunk that materially supports the answer.\n"
                    "- Do not include irrelevant source chunk IDs.\n"
                    "- The book title itself is not evidence; the answer must be supported by "
                    "the content of the source chunks.\n\n"

                    f"Question:\n{question}\n\n"
                    f"Book evidence:\n{context}"
                ),
            )
        ]

        result = self._client.run_stage_structured(
            self._stage_config,
            messages=messages,
            schema=GeneratedAnswerResponse,
        )

        return GeneratedAnswer(
            content=result.answer,
            source_chunk_ids=result.source_chunk_ids,
        )