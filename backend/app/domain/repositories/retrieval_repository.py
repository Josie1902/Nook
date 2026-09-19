from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.retrieval import Retrieval
from app.domain.entities.retrieval_result import RetrievalResult


class RetrievalRepository(ABC):
    @abstractmethod
    def add(self, retrieval: Retrieval) -> Retrieval:
        ...

    @abstractmethod
    def add_results(self, results: List[RetrievalResult]) -> List[RetrievalResult]:
        ...