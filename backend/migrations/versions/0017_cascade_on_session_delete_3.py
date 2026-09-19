"""cascade delete messages with sessions for retrievals result

Revision ID: 0017
Revises: 0016
Create Date: 2026-09-17

"""
from alembic import op

revision = "0017"
down_revision = "0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint(
        "retrieval_results_retrieval_id_fkey",
        "retrieval_results",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "retrieval_results_retrieval_id_fkey",
        "retrieval_results",
        "retrievals",
        ["retrieval_id"],
        ["id"],
        ondelete="CASCADE",
    )

def downgrade() -> None:
    op.drop_constraint(
        "retrieval_results_retrieval_id_fkey",
        "retrieval_results",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "retrieval_results_retrieval_id_fkey",
        "retrieval_results",
        "retrievals",
        ["retrieval_id"],
        ["id"],
    )