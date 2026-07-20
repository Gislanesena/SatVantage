# app/api/mentor/mentor_logic.py

def obter_prompt_missao(missao_id: str, tema_escolhido: str = "Bitcoin") -> str:
    # O desafio agora recebe o tema que o usuário perguntou
    missoes = {
        "traducao": f"""
            DESAFIO: Tradução de Termos. 
            O usuário acabou de perguntar sobre '{tema_escolhido}'. 
            Peça para ele explicar o que entendeu sobre esse tópico de forma simples, 
            como se estivesse explicando para uma criança.
            CRITÉRIO: A explicação deve ser simples, evitar termos técnicos complexos e mostrar que ele entendeu a ideia central.
        """,    
        "riscos": """
            DESAFIO: Simulação de Riscos. 
            O usuário deve identificar por que a promessa de 'lucros fixos e garantidos' em Bitcoin 
            é um sinal claro de golpe. 
            CRITÉRIO: O usuário deve focar na impossibilidade de garantir lucros no mercado financeiro 
            e na natureza imprevisível do Bitcoin.
        """,
        "backup": """
            DESAFIO: Recompensa por Backup. 
            O usuário deve explicar por que manter moedas em corretoras é um risco e por que ter 
            a 'frase semente' (seed phrase) guardada offline é essencial. 
            CRITÉRIO: O foco deve ser a soberania pessoal e o risco de terceiros (custódia).
        """,
        "soberania": """
            DESAFIO: Ato 1 - Soberania Financeira. 
            O usuário deve explicar por que o Bitcoin permite ter controle total sobre o dinheiro 
            sem precisar de autorização de bancos ou governos. 
            CRITÉRIO: A resposta deve mencionar autonomia e independência financeira.
        """
    }
    
    return missoes.get(missao_id, f"Desafio sobre {tema_escolhido}")