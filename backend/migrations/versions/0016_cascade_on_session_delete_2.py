"""cascade delete messages with sessions for retrievals

Revision ID: 0016
Revises: 0015
Create Date: 2026-09-17

"""
from alembic import op

revision = "0016"
down_revision = "0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint(
        "retrievals_message_id_fkey",
        "retrievals",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "retrievals_message_id_fkey",
        "retrievals",
        "messages",
        ["message_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        "retrievals_message_id_fkey",
        "retrievals",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "retrievals_message_id_fkey",
        "retrievals",
        "messages",
        ["message_id"],
        ["id"],
    )