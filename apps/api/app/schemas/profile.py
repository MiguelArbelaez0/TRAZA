
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProfileUpdateRequest(BaseModel):
    display_name: str = Field(min_length=2, max_length=160)
    headline: str | None = Field(default=None, max_length=200)
    professional_summary: str | None = Field(default=None, max_length=5000)
    location: str | None = Field(default=None, max_length=160)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")
        return value

    @field_validator("headline", "professional_summary", "location")
    @classmethod
    def normalize_optional_fields(
        cls, value: str | None
    ) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ProfileResponse(BaseModel):
    id: UUID
    display_name: str
    headline: str | None
    professional_summary: str | None
    location: str | None

    model_config = ConfigDict(from_attributes=True)
