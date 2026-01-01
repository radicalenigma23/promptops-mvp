from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from sqlmodel import SQLModel
from app.models import user, prompt # Ensure prompt model is imported here
from app.api.v1.endpoints import auth, prompts

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- CORS CONFIGURATION ---
origins = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, etc.
    allow_headers=["*"], # Allows Authorization headers
)
# ---------------------------

# Create tables on startup
@app.on_event("startup")
def on_startup():
    print("Connecting to local database and creating tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully!")

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(prompts.router, prefix=f"{settings.API_V1_STR}/prompts", tags=["prompts"])

@app.get("/")
def root():
    return {"message": "PromptOps API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}