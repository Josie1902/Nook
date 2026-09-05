from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base


class BetterAuthUserModel(Base):
    __tablename__ = "user"
    __table_args__ = {"schema": "public"}

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )