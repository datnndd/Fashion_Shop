from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.init_db import init_models
from app.db.session import engine
from app.routers import admin, auth, catalog, cart, health, location, reviews, upload, users, orders, dashboard, marketing


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_models(engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.include_router(health.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(reviews.router)
app.include_router(location.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
app.include_router(cart.router)
app.include_router(marketing.router)
