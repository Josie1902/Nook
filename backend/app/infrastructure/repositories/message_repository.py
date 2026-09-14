import uuid

from sqlalchemy.orm import Session

from app.domain.entities.message import Message, MessageRole
from app.domain.repositories.message_repository import MessageRepository
from app.infrastructure.db.models.message import MessageModel


class SQLAlchemyMessageRepository(MessageRepository):
    def __init__(self, session: Session):
        self.session = session

    def add(self, message: Message) -> Message:
        model = MessageModel(
            id=message.id,
            session_id=message.session_id,
            sequence_number=message.sequence_number,
            role=message.role.value,
            content=message.content,
            error_message=message.error_message,
            created_at=message.created_at,
        )

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)

        return Message(
            id=model.id,
            session_id=model.session_id,
            sequence_number=model.sequence_number,
            role=MessageRole(model.role),
            content=model.content,
            error_message=model.error_message,
            created_at=model.created_at,
        )

    def get_next_sequence_number(self, session_id: uuid.UUID) -> int:
        last_sequence = (
            self.session.query(MessageModel.sequence_number)
            .filter(MessageModel.session_id == session_id)
            .order_by(MessageModel.sequence_number.desc())
            .first()
        )
    
        return (last_sequence[0] + 1) if last_sequence else 1