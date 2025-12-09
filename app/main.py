from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.db.init_db import init_models
from app.db.session import engine
from app.routers import admin, catalog, health, location, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_models(engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(health.router)
app.include_router(users.router)
app.include_router(catalog.router)
app.include_router(location.router)
app.include_router(admin.router)
