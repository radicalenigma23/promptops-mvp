from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.db.session import get_session
from app.models.prompt import Prompt, PromptVersion
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
import uuid
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class PromptUpdate(BaseModel):
    content: str

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

@router.get("/{prompt_id}")
def get_prompt_details(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches a single prompt and its LATEST version content.
    """
    prompt = db.get(Prompt, prompt_id)
    if not prompt or prompt.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Get the latest version for this prompt
    latest_version = db.exec(
        select(PromptVersion)
        .where(PromptVersion.prompt_id == prompt_id)
        .order_by(PromptVersion.version_num.desc())
    ).first()

    return {
        "id": prompt.id,
        "name": prompt.name,
        "slug": prompt.slug,
        "latest_version": latest_version
    }

@router.post("/{prompt_id}/version")
def create_new_version(
    prompt_id: uuid.UUID,
    data: PromptUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new version for an existing prompt (Versioning).
    """
    # 1. Verify ownership
    prompt = db.get(Prompt, prompt_id)
    if not prompt or prompt.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # 2. Determine the next version number
    # Query for the max version_num and add 1
    last_version_num = db.exec(
        select(func.max(PromptVersion.version_num))
        .where(PromptVersion.prompt_id == prompt_id)
    ).one() or 0
    
    new_version_num = last_version_num + 1

    # 3. Create and save the new version
    new_version = PromptVersion(
        content=data.content,
        prompt_id=prompt_id,
        version_num=new_version_num
    )
    
    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return {
        "message": f"Version {new_version_num} created successfully",
        "version_num": new_version_num,
        "content": new_version.content
    }

@router.get("/{prompt_id}/versions", response_model=List[PromptVersion])
def get_prompt_versions(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the full history of versions for a specific prompt.
    """
    # 1. Verify ownership first
    prompt = db.get(Prompt, prompt_id)
    if not prompt or prompt.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # 2. Fetch all versions ordered by version number
    statement = select(PromptVersion).where(
        PromptVersion.prompt_id == prompt_id
    ).order_by(PromptVersion.version_num.desc())
    
    versions = db.exec(statement).all()
    return versions

@router.post("/{prompt_id}/versions/{version_id}/restore")
def restore_version(
    prompt_id: uuid.UUID,
    version_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Takes an old version and saves its content as the newest version.
    """
    # 1. Verify prompt ownership
    prompt = db.get(Prompt, prompt_id)
    if not prompt or prompt.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # 2. Get the specific version to restore
    version_to_restore = db.get(PromptVersion, version_id)
    if not version_to_restore or version_to_restore.prompt_id != prompt_id:
        raise HTTPException(status_code=404, detail="Version not found")

    # 3. Determine the next version number
    last_version_num = db.exec(
        select(func.max(PromptVersion.version_num))
        .where(PromptVersion.prompt_id == prompt_id)
    ).one() or 0
    
    new_version_num = last_version_num + 1

    # 4. Create the NEW version based on OLD content
    new_version = PromptVersion(
        content=version_to_restore.content,
        prompt_id=prompt_id,
        version_num=new_version_num
    )
    
    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return {"message": f"Restored to Version {new_version_num}", "version_num": new_version_num}