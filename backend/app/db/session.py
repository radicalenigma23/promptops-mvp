from sqlmodel import create_engine, Session
from app.core.config import settings

# echo=True is helpful locally to see the SQL commands in your terminal
engine = create_engine(
    settings.DATABASE_URL, 
    echo=True,
    # Standard settings for local development
    connect_args={} 
)

def get_session():
    with Session(engine) as session:
        yield session