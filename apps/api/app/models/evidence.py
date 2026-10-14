from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Evidence(Base):
    __tablename__ = "evidences"
    __table_args__ = (
        CheckConstraint(
            "storage_key IS NOT NULL OR external_url IS NOT NULL",
            name="evidence_has_location",
        ),
        ForeignKeyConstraint(
            ["experience_id", "profile_id"],
            ["experiences.id", "experiences.profile_id"],
            name="fk_evidences_experience_profile",
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    profile_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    experience_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False)
    storage_key: Mapped[str | None] = mapped_column(String(500))
    external_url: Mapped[str | None] = mapped_column(Text)
    visibility: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
