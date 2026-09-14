import uuid

from pydantic import BaseModel, Field

from app.application.generation.ports import (
    AnswerGenerator,
    AnswerSegment,
    ContextChunk,
    GeneratedAnswer,
    GeneratedCitation,
)
from app.core.settings import StageConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.schemas import LLMMessage


class GeneratedCitationResponse(BaseModel):
    chunk_id: str
    quote: str


class AnswerSegmentResponse(BaseModel):
    text: str
    citation: GeneratedCitationResponse | None = None


class GeneratedAnswerResponse(BaseModel):
    segments: list[AnswerSegmentResponse] = Field(default_factory=list)


class LLMAnswerGenerator(AnswerGenerator):
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
                f"[Source Chunk ID: {chunk.chunk_id}]\n"
                f"Book: {chunk.book_title}\n"
                f"Content:\n{chunk.content}"
            )
            for chunk in context_chunks
        )

        messages = [
            LLMMessage(
                role="user",
                content=(
                    "Answer the question using only the provided book evidence.\n\n"

                    "Return a JSON object containing a list of answer segments.\n"
                    "Each segment contains:\n"
                    "- text: a piece of the answer\n"
                    "- citation: the source evidence supporting that text, or null\n"
                    "  if the segment does not require a citation\n\n"

                    "Citation rules:\n"
                    "- Every factual claim must have a supporting citation.\n"
                    "- citation.chunk_id must be exactly one of the provided source "
                    "chunk IDs.\n"
                    "- citation.quote must be an exact quote from that source chunk.\n"
                    "- Do not invent or modify quotes.\n"
                    "- Keep the quote short and directly relevant to the claim.\n"
                    "- Do not cite irrelevant chunks.\n\n"

                    "Answering rules:\n"
                    "- Use only information explicitly supported by the provided "
                    "book evidence.\n"
                    "- Do not use outside knowledge.\n"
                    "- Do not make assumptions beyond the evidence.\n"
                    "- If the evidence is insufficient, return exactly one segment "
                    "with this text: "
                    "\"There is not enough information in the provided books.\" "
                    "and set citation to null.\n\n"

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
            segments=[
                AnswerSegment(
                    text=segment.text,
                    citation=(
                        GeneratedCitation(
                            chunk_id=uuid.UUID(segment.citation.chunk_id),
                            quote=segment.citation.quote,
                        )
                        if segment.citation
                        else None
                    ),
                )
                for segment in result.segments
            ]
        )