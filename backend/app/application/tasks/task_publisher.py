import uuid
from abc import ABC, abstractmethod


class TaskPublisher(ABC):
    @abstractmethod
    def publish_extract_metadata(self, run_id: uuid.UUID) -> None:
        ...

    @abstractmethod
    def publish_chunk_content(self, book_id: uuid.UUID) -> None:
        ...