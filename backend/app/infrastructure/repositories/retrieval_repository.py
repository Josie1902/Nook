from typing import List

from sqlalchemy.orm import Session

from app.domain.entities.retrieval import Retrieval
from app.domain.entities.retrieval_result import RetrievalResult
from app.domain.repositories.retrieval_repository import RetrievalRepository
from app.infrastructure.db.models.retrieval import RetrievalModel, RetrievalResultModel


class SQLAlchemyRetrievalRepository(RetrievalRepository):
    def __init__(self, session: Session):
        self.session = session

    def add(self, retrieval: Retrieval) -> Retrieval:
        model = RetrievalModel(
            id=retrieval.id,
            message_id=retrieval.message_id,
            query=retrieval.query,
            created_at=retrieval.created_at,
            retrieval_metadata=retrieval.metadata,
        )

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)

        return Retrieval(
            id=model.id,
            message_id=model.message_id,
            query=model.query,
            created_at=model.created_at,
            metadata=model.retrieval_metadata,
        )

    def add_results(self, results: List[RetrievalResult]) -> List[RetrievalResult]:
        models = [
            RetrievalResultModel(
                id=result.id,
                retrieval_id=result.retrieval_id,
                chunk_id=result.chunk_id,
                rank=result.rank,
                score=result.score,
            )
            for result in results
        ]

        self.session.add_all(models)
        self.session.commit()

        for model in models:
            self.session.refresh(model)

        return [
            RetrievalResult(
                id=model.id,
                retrieval_id=model.retrieval_id,
                chunk_id=model.chunk_id,
                rank=model.rank,
                score=model.score,
            )
            for model in models
        ]