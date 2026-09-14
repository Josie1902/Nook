import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.entities.reading_session import ReadingSession, SessionMode
from app.domain.repositories.reading_session_repository import ReadingSessionRepository
from app.infrastructure.db.models.reading_session import ReadingSessionModel


def _to_entity(model: ReadingSessionModel) -> ReadingSession:
    return ReadingSession(
        id=model.id,
        user_id=model.user_id,
        topic=model.topic,
        description=model.description,
        mode=SessionMode(model.mode),
        created_at=model.created_at,
    )


class SQLAlchemyReadingSessionRepository(ReadingSessionRepository):
    def __init__(self, session: Session):
        self.session = session

    def add(self, session: ReadingSession) -> ReadingSession:
        model = ReadingSessionModel(
            id=session.id,
            user_id=session.user_id,
            topic=session.topic,
            description=session.description,
            mode=session.mode,
            created_at=session.created_at,
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return _to_entity(model)

    def update(self, session: ReadingSession) -> ReadingSession:
        model = self.session.get(ReadingSessionModel, session.id)
        if model is None:
            raise ValueError("ReadingSession not found")

        model.topic = session.topic
        model.description = session.description
        model.mode = session.mode

        self.session.commit()
        self.session.refresh(model)
        return _to_entity(model)

    def get_by_id(self, session_id: uuid.UUID) -> Optional[ReadingSession]:
        model = self.session.get(ReadingSessionModel, session_id)
        return _to_entity(model) if model else None

    def list_by_user(self, user_id: uuid.UUID) -> List[ReadingSession]:
        models = (
            self.session.query(ReadingSessionModel)
            .filter(ReadingSessionModel.user_id == user_id)
            .order_by(ReadingSessionModel.created_at.desc())
            .all()
        )
        return [_to_entity(m) for m in models]