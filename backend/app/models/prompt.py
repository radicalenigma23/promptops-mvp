import uuid
from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Prompt(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="prompts")
    versions: List["PromptVersion"] = Relationship(back_populates="prompt")

class PromptVersion(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str  # The actual prompt text
    version_num: int = Field(default=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    prompt_id: uuid.UUID = Field(foreign_key="prompt.id")
    prompt: Prompt = Relationship(back_populates="versions")