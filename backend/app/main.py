from dotenv import load_dotenv

load_dotenv()

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.seed_db import seed_if_empty
from app.db.session import SessionLocal, init_db
from app.routers import auth, chat, communications, csv_io, import_data, insights, providers, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Clearview Medical Group — Provider Performance API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(csv_io.router)
app.include_router(providers.router)
app.include_router(insights.router)
app.include_router(chat.router)
app.include_router(reports.router)
app.include_router(import_data.router)
app.include_router(communications.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
