"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-04-17 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "hcps",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("specialty", sa.String(length=100), nullable=True),
        sa.Column("hospital", sa.String(length=200), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("email", sa.String(length=200), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_hcps_name", "hcps", ["name"])
    op.create_index("ix_hcps_specialty", "hcps", ["specialty"])
    op.create_index("ix_hcps_city", "hcps", ["city"])

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("therapeutic_area", sa.String(length=100), nullable=True),
        sa.Column("sku", sa.String(length=50), nullable=True, unique=True),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_products_name", "products", ["name"])
    op.create_index("ix_products_therapeutic_area", "products", ["therapeutic_area"])

    op.create_table(
        "interactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hcp_id", sa.Integer(), sa.ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("channel", sa.String(length=20), nullable=False),
        sa.Column("outcome", sa.String(length=50), nullable=True),
        sa.Column("sentiment", sa.String(length=20), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("raw_notes", sa.Text(), nullable=True),
        sa.Column("products_discussed", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("next_step", sa.Text(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_interactions_hcp_id", "interactions", ["hcp_id"])

    op.create_table(
        "follow_ups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hcp_id", sa.Integer(), sa.ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interaction_id", sa.Integer(), sa.ForeignKey("interactions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_follow_ups_hcp_id", "follow_ups", ["hcp_id"])
    op.create_index("ix_follow_ups_interaction_id", "follow_ups", ["interaction_id"])
    op.create_index("ix_follow_ups_due_at", "follow_ups", ["due_at"])


def downgrade() -> None:
    op.drop_index("ix_follow_ups_due_at", table_name="follow_ups")
    op.drop_index("ix_follow_ups_interaction_id", table_name="follow_ups")
    op.drop_index("ix_follow_ups_hcp_id", table_name="follow_ups")
    op.drop_table("follow_ups")
    op.drop_index("ix_interactions_hcp_id", table_name="interactions")
    op.drop_table("interactions")
    op.drop_index("ix_products_therapeutic_area", table_name="products")
    op.drop_index("ix_products_name", table_name="products")
    op.drop_table("products")
    op.drop_index("ix_hcps_city", table_name="hcps")
    op.drop_index("ix_hcps_specialty", table_name="hcps")
    op.drop_index("ix_hcps_name", table_name="hcps")
    op.drop_table("hcps")
