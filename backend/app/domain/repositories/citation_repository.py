from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.citation import Citation
from app.application.use_cases.dtos import CitationDTO

class CitationRepository(ABC):
    @abstractmethod
    def add_many(self, citations: List[Citation]) -> List[Citation]:
        ...

    @abstractmethod
    def list_by_message(self, message_id) -> List[CitationDTO]:
        ...