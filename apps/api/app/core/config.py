from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TRAZA API"
    app_version: str = "0.1.0"
    app_description: str = (
        "API para gestionar trayectorias profesionales, "
        "competencias y evidencias."
    )
    database_url: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
