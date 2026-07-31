from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "MedQ AI"
    ENV: str = "development"
    SECRET_KEY: str = "change_me_super_secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # PostgreSQL Credentials
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "your_password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "medq_ai"

    # Database URL constructed from env vars if not explicitly provided
    DATABASE_URL: Optional[str] = None

    REDIS_URL: str = "redis://localhost:6379/0"
    MODEL_STORE_PATH: str = "./models_store"
    QUANTUM_BACKEND: str = "default.qubit"

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
