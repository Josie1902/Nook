import uuid
from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.processing_run import ProcessingRun


class ProcessingRunRepository(ABC):

    @abstractmethod
    def add(self, run: ProcessingRun) -> ProcessingRun:
        ...

    @abstractmethod
    def get_by_id(self, run_id: uuid.UUID) -> Optional[ProcessingRun]:
        ...

    @abstractmethod
    def update(self, run: ProcessingRun) -> ProcessingRun:
        ...

    @abstractmethod
    def list_by_book(self, book_id: uuid.UUID) -> List[ProcessingRun]:
        ...

    @abstractmethod
    def get_active_by_book(
        self,
        book_id: uuid.UUID,
    ) -> Optional[ProcessingRun]:
        ...
