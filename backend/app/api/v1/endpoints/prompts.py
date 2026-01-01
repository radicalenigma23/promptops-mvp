from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.prompt import Prompt, PromptVersion
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
import uuid

router = APIRouter()

@router.post("/create")
def create_prompt(
    name: str, 
    content: str, 
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Create the Prompt container
    new_prompt = Prompt(
        name=name, 
        slug=name.lower().replace(" ", "-"), 
        owner_id=current_user.id
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    
    # 2. Create the first version (v1)
    new_version = PromptVersion(content=content, prompt_id=new_prompt.id)
    db.add(new_version)
    db.commit()
    
    return {"status": "success", "prompt_id": new_prompt.id}

@router.get("/")
def list_my_prompts(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Fetch all prompts belonging to the logged-in user
    statement = select(Prompt).where(Prompt.owner_id == current_user.id)
    results = db.exec(statement).all()
    return results