"""cascade delete messages with sessions

Revision ID: 0015
Revises: 0014
Create Date: 2026-09-17

"""
from alembic import op

revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "messages_session_id_fkey",
        "messages",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "messages_session_id_fkey",
        "messages",
        "reading_sessions",
        ["session_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        "citations_message_id_fkey",
        "citations",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "citations_message_id_fkey",
        "citations",
        "messages",
        ["message_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint(
        "messages_session_id_fkey",
        "messages",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "messages_session_id_fkey",
        "messages",
        "reading_sessions",
        ["session_id"],
        ["id"],
    )

    op.drop_constraint(
        "citations_message_id_fkey",
        "citations",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "citations_message_id_fkey",
        "citations",
        "messages",
        ["message_id"],
        ["id"],
    )