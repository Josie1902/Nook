import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.entities.processing_run import (
    ProcessingRun,
    ProcessingRunStage,
    ProcessingRunStatus,
)
from app.domain.repositories.processing_run_repository import ProcessingRunRepository
from app.infrastructure.db.models.processing_run import ProcessingRunModel


def _to_entity(model: ProcessingRunModel) -> ProcessingRun:
    return ProcessingRun(
        id=model.id,
        book_id=model.book_id,
        config_version=model.config_version,
        status=ProcessingRunStatus(model.status),
        current_stage=ProcessingRunStage(model.current_stage) if model.current_stage else None,
        metrics=model.metrics,
        error_code=model.error_code,
        error_message=model.error_message,
        error_details=model.error_details,
        started_at=model.started_at,
        completed_at=model.completed_at,
        created_at=model.created_at,
    )


class SQLAlchemyProcessingRunRepository(ProcessingRunRepository):
    def __init__(self, session: Session):
        self.session = session

    def add(self, run: ProcessingRun) -> ProcessingRun:
        model = ProcessingRunModel(
            id=run.id,
            book_id=run.book_id,
            config_version=run.config_version,
            status=run.status.value,
            current_stage=run.current_stage.value if run.current_stage else None,
            metrics=run.metrics,
            error_code=run.error_code,
            error_message=run.error_message,
            error_details=run.error_details,
            started_at=run.started_at,
            completed_at=run.completed_at,
            created_at=run.created_at,
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return _to_entity(model)

    def get_by_id(self, run_id: uuid.UUID) -> Optional[ProcessingRun]:
        model = self.session.get(ProcessingRunModel, run_id)
        return _to_entity(model) if model else None

    def get_active_by_book(self, book_id: uuid.UUID) -> Optional[ProcessingRun]:
        statement = select(ProcessingRunModel).where(
            ProcessingRunModel.book_id == book_id,
            ProcessingRunModel.status.in_([
                ProcessingRunStatus.PENDING.value,
                ProcessingRunStatus.RUNNING.value,
            ]),
        )
        model = self.session.scalar(statement)
        return _to_entity(model) if model else None

    def list_by_book(self, book_id: uuid.UUID) -> list[ProcessingRun]:
        statement = select(ProcessingRunModel).where(
            ProcessingRunModel.book_id == book_id
        )
        models = self.session.scalars(statement).all()
        return [_to_entity(model) for model in models]

    def update(self, run: ProcessingRun) -> ProcessingRun:
        model = self.session.get(ProcessingRunModel, run.id)
        if model is None:
            raise ValueError("ProcessingRun not found")

        model.status = run.status.value
        model.current_stage = run.current_stage.value if run.current_stage else None
        model.metrics = run.metrics
        model.error_code = run.error_code
        model.error_message = run.error_message
        model.error_details = run.error_details
        model.started_at = run.started_at
        model.completed_at = run.completed_at

        self.session.commit()
        self.session.refresh(model)
        return _to_entity(model)
