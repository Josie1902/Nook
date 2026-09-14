from abc import ABC, abstractmethod
from dataclasses import dataclass
import uuid


@dataclass
class ContextChunk:
    chunk_id: uuid.UUID
    book_id: uuid.UUID
    book_title: str
    page_start: int
    page_end: int
    content: str



@dataclass
class GeneratedAnswer:
    content: str
    source_chunk_ids: list[str]


class AnswerGenerator(ABC):

    @abstractmethod
    def generate(
        self,
        question: str,
        context_chunks: list[ContextChunk],
    ) -> GeneratedAnswer:
        ...