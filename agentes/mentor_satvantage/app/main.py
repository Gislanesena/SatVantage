"""SatVantage — AI Mentor API (FastAPI)."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.mentor.mentor_router import router as mentor_router
from app.deps import get_llm_service

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("SatVantage")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not os.getenv("GROQ_API_KEY"):
        logger.warning("GROQ_API_KEY ausente — rotas de mentoria falharão ao chamar o LLM.")
    logger.info("SatVantage Mentor API iniciada")
    yield
    try:
        await get_llm_service().aclose()
    except Exception:
        pass


app = FastAPI(title="SatVantage - AI Mentor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    # Front em Vercel / preview + Render docs
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Contrato do SatVantage Next: /api/agents/* → AGENTS_API_URL + /api/mentor|interact
# (antes estava /api/api/... e o proxy do front recebia 404)
app.include_router(mentor_router, prefix="/api", tags=["Mentor"])
# Alias compatível com Streamlit / clients antigos que ainda usam /api/api/...
app.include_router(mentor_router, prefix="/api/api", tags=["Mentor"], include_in_schema=False)


@app.get("/", include_in_schema=False)
async def redirect_to_docs() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "mensagem": "SatVantage está online!"}
