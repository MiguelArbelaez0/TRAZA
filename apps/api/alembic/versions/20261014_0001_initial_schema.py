"""Create the initial TRAZA MVP schema.

Revision ID: 20261014_0001
Revises:
Create Date: 2026-10-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261014_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the six tables belonging to the TRAZA MVP."""

    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("auth_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("display_name", sa.String(length=160), nullable=False),
        sa.Column("headline", sa.String(length=200), nullable=True),
        sa.Column("professional_summary", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=160), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_profiles"),
    )
    op.create_index(
        "ix_profiles_auth_user_id",
        "profiles",
        ["auth_user_id"],
        unique=True,
    )

    op.create_table(
        "competencies",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_competencies"),
    )
    op.create_index(
        "ix_competencies_name",
        "competencies",
        ["name"],
        unique=False,
    )

    op.create_table(
        "experiences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("experience_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("organization", sa.String(length=200), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column(
            "is_current",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column("visibility", sa.String(length=30), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "end_date IS NULL OR end_date >= start_date",
            name="ck_experiences_valid_experience_dates",
        ),
        sa.CheckConstraint(
            "is_current = false OR end_date IS NULL",
            name="ck_experiences_current_experience_without_end_date",
        ),
        sa.ForeignKeyConstraint(
            ["profile_id"],
            ["profiles.id"],
            name="fk_experiences_profile_id_profiles",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_experiences"),
        sa.UniqueConstraint(
            "id",
            "profile_id",
            name="uq_experiences_id_profile",
        ),
    )
    op.create_index(
        "ix_experiences_profile_id",
        "experiences",
        ["profile_id"],
        unique=False,
    )

    op.create_table(
        "portfolios",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column(
            "is_published",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "published_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["profile_id"],
            ["profiles.id"],
            name="fk_portfolios_profile_id_profiles",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_portfolios"),
        sa.UniqueConstraint(
            "profile_id",
            name="uq_portfolios_profile_id",
        ),
    )
    op.create_index(
        "ix_portfolios_slug",
        "portfolios",
        ["slug"],
        unique=True,
    )

    op.create_table(
        "experience_competencies",
        sa.Column("experience_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("competency_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("proficiency_level", sa.String(length=50), nullable=True),
        sa.Column("context_description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["competency_id"],
            ["competencies.id"],
            name="fk_experience_competencies_competency_id_competencies",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["experience_id"],
            ["experiences.id"],
            name="fk_experience_competencies_experience_id_experiences",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "experience_id",
            "competency_id",
            name="pk_experience_competencies",
        ),
    )

    op.create_table(
        "evidences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("experience_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("evidence_type", sa.String(length=50), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=True),
        sa.Column("external_url", sa.Text(), nullable=True),
        sa.Column("visibility", sa.String(length=30), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "storage_key IS NOT NULL OR external_url IS NOT NULL",
            name="ck_evidences_evidence_has_location",
        ),
        sa.ForeignKeyConstraint(
            ["experience_id", "profile_id"],
            ["experiences.id", "experiences.profile_id"],
            name="fk_evidences_experience_profile",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["profile_id"],
            ["profiles.id"],
            name="fk_evidences_profile_id_profiles",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_evidences"),
    )
    op.create_index(
        "ix_evidences_profile_id",
        "evidences",
        ["profile_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove the MVP schema in reverse dependency order."""

    op.drop_index("ix_evidences_profile_id", table_name="evidences")
    op.drop_table("evidences")

    op.drop_table("experience_competencies")

    op.drop_index("ix_portfolios_slug", table_name="portfolios")
    op.drop_table("portfolios")

    op.drop_index("ix_experiences_profile_id", table_name="experiences")
    op.drop_table("experiences")

    op.drop_index("ix_competencies_name", table_name="competencies")
    op.drop_table("competencies")

    op.drop_index("ix_profiles_auth_user_id", table_name="profiles")
    op.drop_table("profiles")

