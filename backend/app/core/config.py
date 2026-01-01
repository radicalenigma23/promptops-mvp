from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PromptOps MVP"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SET_THIS_TO_A_LONG_RANDOM_STRING" # Used for JWT
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 Days
    
    # This URL is for Docker (service name 'db' is used as the hostname)
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/db"


    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()