from abc import ABC, abstractmethod

from app.domain.entities.user import User


class SessionRepository(ABC):

    @abstractmethod
    def get_user_by_session_token(self, token: str) -> User | None:
        ...