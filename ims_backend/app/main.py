# app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, dashboard, history, operations, products, users, warehouses
from app.db.session import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (simple approach; use Alembic for production migrations)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CoreInventory API",
    version="1.0.0",
    description="Inventory Management System — FastAPI backend",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React dev server (and any localhost port) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router,        prefix=API_PREFIX)
app.include_router(users.router,       prefix=API_PREFIX)
app.include_router(warehouses.router,  prefix=API_PREFIX)
app.include_router(products.router,    prefix=API_PREFIX)
app.include_router(operations.router,  prefix=API_PREFIX)
app.include_router(history.router,     prefix=API_PREFIX)
app.include_router(dashboard.router,   prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "CoreInventory API is running"}
