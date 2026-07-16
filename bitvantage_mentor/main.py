from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.endpoints.mentor import router as mentor_router

import logging

# 1. Configurações
# Carrega as variáveis do seu .env (como o HF_TOKEN)
load_dotenv()

# 2. App FastAPI
app = FastAPI(title="BTCVantage - AI Mentor API")

@app.get("/health")
async def health_check():
    return {"status": "ok", "mensagem": "BitcoinOS API está online!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mentor_router, prefix="/api")

# Configuração básica: salva em um arquivo e mostra no terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"), # Salva tudo aqui
        logging.StreamHandler()          # Mostra no terminal também
    ]
)
logger = logging.getLogger("BitcoinOS")