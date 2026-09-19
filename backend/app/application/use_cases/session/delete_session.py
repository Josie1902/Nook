import uuid
from app.domain.repositories.reading_session_repository import ReadingSessionRepository


class DeleteSessionUseCase:
    def __init__(self, session_repository: ReadingSessionRepository):
        self.session_repository = session_repository

    def execute(
        self,
        session_id: uuid.UUID,
        user_id: str,
    ) -> None:
        session = self.session_repository.get_by_id(session_id)

        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        self.session_repository.delete(session_id)