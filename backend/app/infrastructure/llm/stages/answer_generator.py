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


class AnswerSegmentResponse(BaseModel):
    text: str
    citations: list[str] = Field(default_factory=list)


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
                f"[Chunk {chunk.chunk_id}]\n"
                f"Title: {chunk.book_title}\n"
                f"Author: {chunk.book_author}\n"
                f"Passage:\n{chunk.content}"
            )
            for chunk in context_chunks
        )

        messages = [
            LLMMessage(
                role="user",
                content=(
                    "Answer the reader's question using ONLY the provided book passages.\n\n"

                    "You are a helpful librarian. Answer directly and naturally using "
                    "the information in the passages.\n"
                    "- Do not summarize the books.\n"
                    "- Do not repeatedly say \"the book says\" or \"the author says\".\n"
                    "- Explain the relevant ideas directly to the reader.\n"
                    "- Do not add information that is not supported by the passages.\n"
                    "- Do not use outside knowledge.\n"
                    "- Do not mention chunks or citations in the answer text.\n\n"

                    "CITATIONS\n"
                    "- Every answer segment must have at least one citation when "
                    "the segment contains information from the passages.\n"
                    "- A segment may have multiple citations.\n"
                    "- Each citation must be the exact ID of a provided chunk.\n"
                    "- Only cite chunks that directly support the segment.\n"
                    "- Do not invent chunk IDs.\n"
                    "- Do not provide quotes. The application will obtain the exact "
                    "quote from the cited chunk.\n\n"

                    "OUTPUT\n"
                    "Return ONLY valid JSON:\n"
                    "{\n"
                    '  "segments": [\n'
                    "    {\n"
                    '      "text": "natural answer",\n'
                    '      "citations": ["chunk-id"]\n'
                    "    }\n"
                    "  ]\n"
                    "}\n\n"

                    "If there is not enough information, return exactly:\n"
                    "{"
                    '"segments":[{"text":"There is not enough information in the '
                    'provided books.","citations":[]}]'
                    "}\n\n"

                    f"QUESTION:\n{question}\n\n"
                    f"BOOK PASSAGES:\n{context}"
                ),
            )
        ]

        result = self._client.run_stage_structured(
            self._stage_config,
            messages=messages,
            schema=GeneratedAnswerResponse,
        )

        chunks_by_id = {
            chunk.chunk_id: chunk
            for chunk in context_chunks
        }

        return GeneratedAnswer(
            segments=[
                AnswerSegment(
                    text=segment.text,
                    citations=[
                        GeneratedCitation(
                            chunk_id=chunk_id,
                            quote=chunks_by_id[chunk_id].content,
                        )
                        for citation in segment.citations
                        if (chunk_id := uuid.UUID(citation)) in chunks_by_id
                    ],
                )
                for segment in result.segments
            ]
        )