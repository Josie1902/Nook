import json
import uuid

from pydantic import BaseModel, Field

from app.application.generation.ports import BookRecommendation, BookRecommender, BookSummary
from app.core.settings import StageConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.schemas import LLMMessage


class RecommendationItem(BaseModel):
    book_id: str
    reason: str


class BookRecommendationResponse(BaseModel):
    books: list[RecommendationItem] = Field(default_factory=list)


class LLMBookRecommender(BookRecommender):
    def __init__(self, llm_client: BaseLLMClient, stage_config: StageConfig):
        self._client = llm_client
        self._stage_config = stage_config

    def recommend(
        self,
        topic: str,
        description: str,
        books: list[BookSummary],
    ) -> list[BookRecommendation]:
        if not books:
            return []

        book_lines = []
        for book in books:
            metadata = [
                f"book_id: {book.book_id}",
                f"title: {book.title}",
            ]
            if book.author:
                metadata.append(f"author: {book.author}")
            if book.description:
                metadata.append(f"description: {book.description}")
            if book.tags:
                metadata.append(f"tags: {', '.join(book.tags)}")
            book_lines.append("\n".join(metadata))

        payload = "\n\n".join([
            "Recommend the best 3 books from the list below for the following research topic.",
            f"Research topic: {topic}",
            f"Research description: {description}",
            "Return JSON with a top-level key 'books' whose value is a list of objects with 'book_id' and 'reason'.",
            "Only include book_id values that appear in the list. Do not invent IDs.",
            "Choose the most relevant books and explain briefly why each one is useful.",
            "",
            "Books:",
            *book_lines,
        ])

        result = self._client.run_stage_structured(
            self._stage_config,
            messages=[LLMMessage(role="user", content=payload)],
            schema=BookRecommendationResponse,
        )

        recommendations: list[BookRecommendation] = []
        seen = set()
        for item in result.books:
            try:
                book_id = uuid.UUID(item.book_id)
            except ValueError:
                continue
            if book_id in seen:
                continue
            seen.add(book_id)
            recommendations.append(BookRecommendation(book_id=book_id, reason=item.reason))
        return recommendations
