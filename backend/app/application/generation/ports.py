from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import uuid


@dataclass(frozen=True)
class BookSummary:
    book_id: uuid.UUID
    title: str
    author: str | None = None
    description: str | None = None
    tags: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class BookRecommendation:
    book_id: uuid.UUID
    reason: str


@dataclass(frozen=True)
class ResearchDetails:
    topic: str
    description: str


class ResearchGenerator(ABC):

    @abstractmethod
    def generate(self, request: str) -> ResearchDetails:
        ...

    @abstractmethod
    def refine(
        self,
        topic: str,
        description: str,
        comments: str,
    ) -> ResearchDetails:
        ...


@dataclass
class ContextChunk:
    chunk_id: uuid.UUID
    book_id: uuid.UUID
    book_title: str
    book_author: str
    content: str


@dataclass
class GeneratedCitation:
    chunk_id: uuid.UUID
    quote: str


@dataclass
class AnswerSegment:
    text: str
    citations: list[GeneratedCitation] = field(default_factory=list)


@dataclass
class GeneratedAnswer:
    segments: list[AnswerSegment]


class AnswerGenerator(ABC):

    @abstractmethod
    def generate(
        self,
        question: str,
        context_chunks: list[ContextChunk],
    ) -> GeneratedAnswer:
        ...


class BookRecommender(ABC):

    @abstractmethod
    def recommend(
        self,
        topic: str,
        description: str,
        books: list[BookSummary],
    ) -> list[BookRecommendation]:
        ...