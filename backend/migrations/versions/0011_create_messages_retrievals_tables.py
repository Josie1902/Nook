"""create messages, retrievals, retrieval_results tables

Revision ID: 0011
Revises: 0010
Create Date: 2026-08-17
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "messages",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("reading_sessions.id"),
            nullable=False,
        ),
        sa.Column(
            "sequence_number",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(),
            nullable=False,
            server_default="user",
        ),
        sa.Column(
            "content",
            postgresql.JSONB(),
            nullable=False,
        ),
        sa.Column(
            "error_message",
            sa.String(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "session_id",
            "sequence_number",
            name="uq_messages_session_sequence",
        ),
    )

    op.create_index(
        "ix_messages_session_id",
        "messages",
        ["session_id"],
    )

    op.create_table(
        "retrievals",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "message_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("messages.id"),
            nullable=False,
        ),
        sa.Column(
            "query",
            sa.String(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )

    op.create_index(
        "ix_retrievals_message_id",
        "retrievals",
        ["message_id"],
    )

    op.create_table(
        "retrieval_results",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "retrieval_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("retrievals.id"),
            nullable=False,
        ),
        sa.Column(
            "chunk_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chunks.id"),
            nullable=False,
        ),
        sa.Column(
            "rank",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "score",
            sa.Float(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_retrieval_results_retrieval_id",
        "retrieval_results",
        ["retrieval_id"],
    )

    op.create_index(
        "ix_retrieval_results_chunk_id",
        "retrieval_results",
        ["chunk_id"],
    )

    sa.CheckConstraint(
        "rank > 0",
        name="ck_retrieval_results_rank_positive",
    )


def downgrade():
    op.drop_index(
        "ix_retrieval_results_chunk_id",
        table_name="retrieval_results",
    )
    op.drop_index(
        "ix_retrieval_results_retrieval_id",
        table_name="retrieval_results",
    )
    op.drop_table("retrieval_results")

    op.drop_index(
        "ix_retrievals_message_id",
        table_name="retrievals",
    )
    op.drop_table("retrievals")

    op.drop_index(
        "ix_messages_session_id",
        table_name="messages",
    )
    op.drop_table("messages")