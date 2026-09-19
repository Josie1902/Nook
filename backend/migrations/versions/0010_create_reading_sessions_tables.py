"""create reading_sessions and reading_session_books tables

Revision ID: 0010
Revises: 0009
Create Date: 2026-08-17

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "reading_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True),  primary_key=True,
        ),
        sa.Column("user_id", sa.Text(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("topic", sa.String(), nullable=False),
        sa.Column("mode", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_index(
        "ix_reading_sessions_user_id",
        "reading_sessions",
        ["user_id"],
    )

    op.create_table(
        "reading_session_books",
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey(
                "reading_sessions.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),
        sa.Column(
            "book_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey(
                "books.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),
        sa.Column(
            "added_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.PrimaryKeyConstraint(
            "session_id",
            "book_id",
            name="reading_session_books_pkey",
        ),
    )

    op.create_index(
        "ix_reading_session_books_book_id",
        "reading_session_books",
        ["book_id"],
    )


def downgrade():
    op.drop_index(
        "ix_reading_session_books_book_id",
        table_name="reading_session_books",
    )
    op.drop_table("reading_session_books")

    op.drop_index(
        "ix_reading_sessions_user_id",
        table_name="reading_sessions",
    )
    op.drop_table("reading_sessions")