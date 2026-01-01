from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.user import User
from app.core import security
from app.core.config import settings
from jose import jwt, JWTError

router = APIRouter()

# This tells FastAPI where to look for the token during login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

@router.post("/register")
def register_user(email: str, password: str, full_name: str = None, db: Session = Depends(get_session)):
    user_exists = db.exec(select(User).where(User.email == email)).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="User already registered")
    
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=security.get_password_hash(password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/token")
def login_for_access_token(db: Session = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm uses 'username' field even if we use email
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = security.create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)):
    """
    Decodes the token, extracts the user ID, and returns the current user object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user