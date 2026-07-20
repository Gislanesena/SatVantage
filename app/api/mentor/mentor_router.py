import logging
from fastapi import APIRouter, HTTPException
from app.schemas.mentor import MentorRequest, MentorResponse
from app.services.llm_service import LLMService
from pydantic import BaseModel
from .mentor_logic import obter_prompt_missao # Certifique-se de que o nome do arquivo esteja correto
from typing import Optional

logger = logging.getLogger("SatVantageLLMService")
router = APIRouter()

# --- SUA ROTA ORIGINAL ---
@router.post("/mentor", response_model=MentorResponse)
async def get_mentorship(dados: MentorRequest):
    logger.info(f"Nova requisição recebida: nível={dados.nivel_conhecimento}, pergunta='{dados.mensagem_usuario[:30]}...'")
    try:
        service = LLMService()
        # Se for a inicialização padrão, podemos deixar a IA responder ou mandar a frase fixa
        if dados.mensagem_usuario.lower() in ["iniciar", "iniciando a missão"]:
            resposta = "Qual sua dúvida sobre bitcoin hj?"
        else:
            resposta = await service.generate_mentorship(dados.mensagem_usuario, dados.nivel_conhecimento)
            
        return {"resposta_ia": resposta, "nivel_aplicado": dados.nivel_conhecimento}
    except Exception as e:
        logger.error(f"Erro ao gerar mentoria: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
class InteractionRequest(BaseModel):
    mensagem_usuario: str
    missao_id: Optional[str] = None
    tema_atual: Optional[str] = "Bitcoin" # Novo campo para capturar o tema

@router.post("/interact")
async def interact(data: InteractionRequest):
    service = LLMService()

    instrucao = data.mensagem_usuario
    
    # Lógica Híbrida: define o comportamento da IA
    if data.missao_id:
        prompt_missao = obter_prompt_missao(data.missao_id, data.tema_atual)
        
        instrucao = f"""
        Você é um classificador de respostas. Analise o desafio: {prompt_missao}
        
        Siga estritamente estes exemplos de saída:
        Resposta: "o bitcoin é um bolo" -> Saída: ERRO_ESCOPO
        Resposta: "é uma carteira digital para guardar chaves" -> Saída: APROVADO
        Resposta: "é um computador potente" -> Saída: REPROVADO
        
        Apenas classifique a seguinte resposta do usuário, sem explicações:
        Resposta do usuário: "{data.mensagem_usuario}"
        Saída:
        """
        
        resultado_bruto = await service.generate_mentorship(instrucao, level="iniciante")
        res = resultado_bruto.strip().upper()
        
        # Log para você ver no terminal o que a IA está respondendo de verdade
        print(f"DEBUG: IA respondeu: {res}") 

        if "APROVADO" in res:
            return {"status": "success", "message": "Parabéns, missão concluída!"}
        
        elif "ERRO_ESCOPO" in res:
            return {"status": "try_again", "feedback": "Este assunto não faz parte da nossa trilha de Bitcoin."}
            
        else:
            return {"status": "try_again", "feedback": "Resposta incorreta. Tente explicar de forma mais simples e direta sobre o tema."}
        
        resultado_bruto = await service.generate_mentorship(instrucao, level="iniciante")
        res = resultado_bruto.strip().upper()
    
        if "APROVADO" in res:
            return {"status": "success", "message": "Parabéns, missão concluída!"}
        elif "ERRO_ESCOPO" in res:
            return {"status": "try_again", "feedback": "Este assunto não faz parte da nossa trilha de Bitcoin."}
        else:
            return {"status": "try_again", "feedback": "Resposta incorreta. Tente explicar de forma mais simples e direta sobre o tema."}
    
    # Se NÃO for missão (missao_id é None), o código continua normalmente
    resultado = await service.generate_mentorship(instrucao, level="iniciante")
    return {"status": "chat", "resposta": resultado}

# --- SUA NOVA ROTA DE GAMIFICAÇÃO (Substitua a antiga por esta!) ---
class TaskValidation(BaseModel):
    user_id: str
    user_response: str

@router.post("/validate-task/{missao_id}")
async def validate_task(missao_id: str, data: TaskValidation):
    service = LLMService()
    prompt_missao = obter_prompt_missao(missao_id)
    
    evaluation_prompt = f"""
    Contexto: Você é um mentor rígido de Bitcoin.
    {prompt_missao}
    
    Resposta do usuário: '{data.user_response}'
    
    INSTRUÇÕES DE AVALIAÇÃO:
    Você é um validador de trilha educacional de Bitcoin.
    
    PASSO 1: Verifique se a resposta do usuário é sobre o tema 'Bitcoin' e se tenta responder ao desafio.
    - Se a resposta for sobre outro assunto (receitas, esportes, etc), responda APENAS: "REPROVADO: Este assunto não faz parte da nossa trilha de Bitcoin."
    
    PASSO 2: Se for sobre Bitcoin, verifique se a resposta cumpre o desafio.
    - Se cumprir, responda APENAS: "APROVADO".
    - Se falhar ou estiver incorreto, responda APENAS: "REPROVADO" seguido de uma dica curta e motivadora.
    """
           
    try:
        resultado = await service.generate_mentorship(evaluation_prompt, level="iniciante")
        if "APROVADO" in resultado.strip().upper():
            return {"status": "success", "message": f"Parabéns! Missão {missao_id} concluída!"}
        
        return {"status": "try_again", "feedback": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))