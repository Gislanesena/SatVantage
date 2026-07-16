import os
import time
import logging
from huggingface_hub import InferenceClient

logger = logging.getLogger("BitcoinOS.LLMService")

class LLMService:
    def __init__(self):
        # Prevenção: Validação de ambiente antes de tentar conectar
        token = os.getenv("HF_TOKEN")
        if not token:
            raise ValueError("Erro de configuração: HF_TOKEN não encontrado no .env")
        self.client = InferenceClient(token=token)
        self.model = "meta-llama/Llama-3.1-8B-Instruct"

    def _eh_assunto_permitido(self, prompt: str) -> bool:
        # Palavras-chave simples para filtrar o escopo
        temas_permitidos = ["bitcoin", "cripto", "blockchain", "carteira", "satoshis", "investimento"]
        prompt_lower = prompt.lower()
        return any(tema in prompt_lower for tema in temas_permitidos)

    async def generate_mentorship(self, prompt: str, level: str) -> str:
        if not self._eh_assunto_permitido(prompt):
            logger.warning(f"Tentativa de assunto fora do escopo bloqueada: {prompt}")
            return "Desculpe, sou um mentor especializado exclusivamente em Bitcoin. Por favor, faça uma pergunta sobre o tema!"
        messages = [
            {"role": "system", "content": f"Você é um mentor Bitcoin. Nível: {level}. Responda em PT-BR."},
            {"role": "user", "content": prompt}
        ]
        
        # Prevenção: Lógica de Retry (tentar novamente caso a API falhe)
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.client.chat_completion(messages, model=self.model)
                return response.choices[0].message.content
            except Exception as e:
                # Se for a última tentativa, levanta o erro
                if attempt == max_retries - 1:
                    raise e
                
                # Espera 2 segundos antes de tentar novamente (aumenta o tempo se quiser)
                print(f"Tentativa {attempt + 1} falhou. Tentando novamente...")
                time.sleep(2)