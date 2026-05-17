from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine
from .models import Base
from .routes import auth_routes, song_routes
from .routes import auth_routes, song_routes, playlist_routes

app = FastAPI(title="MusicStream API")

Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
SONGS_DIR = UPLOADS_DIR / "songs"
COVERS_DIR = UPLOADS_DIR / "covers"

UPLOADS_DIR.mkdir(exist_ok=True)
SONGS_DIR.mkdir(exist_ok=True)
COVERS_DIR.mkdir(exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(song_routes.router)
app.include_router(playlist_routes.router)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/")
def home():
    return {
        "message": "MusicStream API is running"
    }