from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse # Adicione esta linha
from dotenv import load_dotenv
from app.api.mentor.mentor_router import router as mentor_router
import logging

# 1. Configurações
# Carrega as variáveis do seu .env (como o HF_TOKEN)
load_dotenv()

app = FastAPI(title="SatVantage - AI Mentor API")

# Adicione este bloco aqui:
@app.get("/", include_in_schema=False)
async def redirect_to_docs():
    return RedirectResponse(url="/docs")

# 2. App FastAPI
app = FastAPI(title="SatVantage - AI Mentor API")

@app.get("/health")
async def health_check():
    return {"status": "ok", "mensagem": "SatVantage está online!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mentor_router, prefix="/api/api", tags=["Mentor"])

# Configuração básica: salva em um arquivo e mostra no terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"), # Salva tudo aqui
        logging.StreamHandler()          # Mostra no terminal também
    ]
)
logger = logging.getLogger("SatVantage")