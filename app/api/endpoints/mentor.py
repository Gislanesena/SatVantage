import logging
from fastapi import APIRouter, HTTPException
from app.schemas.mentor import MentorRequest, MentorResponse
from app.services.llm_service import LLMService

logger = logging.getLogger("BitcoinOS") # Pega o mesmo logger do main
router = APIRouter()

@router.post("/mentor", response_model=MentorResponse)
async def get_mentorship(dados: MentorRequest):
    logger.info(f"Nova requisição recebida: nível={dados.nivel_conhecimento}, pergunta='{dados.mensagem_usuario[:30]}...'")
    
    try:
        service = LLMService()
        resposta = await service.generate_mentorship(dados.mensagem_usuario, dados.nivel_conhecimento)
        logger.info("Resposta da IA gerada com sucesso.")
        return {"resposta_ia": resposta, "nivel_aplicado": dados.nivel_conhecimento}
    except Exception as e:
        logger.error(f"Erro ao gerar mentoria: {str(e)}") # Loga o erro específico
        raise HTTPException(status_code=500, detail=str(e))