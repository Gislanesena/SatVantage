import streamlit as st
import requests

st.title("Mentor SatVantage")

# Inicializa o histórico de mensagens
if "messages" not in st.session_state:
    st.session_state.messages = []

# Exibe o histórico de mensagens
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Campo de entrada
if prompt := st.chat_input("Como posso te ajudar hoje?"):
    # Exibe a mensagem do usuário
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Envia para a API
    url = "http://127.0.0.1:8000/api/api/interact"
    payload = {"mensagem_usuario": prompt, "missao_id": None, "tema_atual": "Bitcoin"}
    
    try:
        response = requests.post(url, json=payload).json()
        # Pega a resposta da IA (do campo 'resposta' ou 'message')
        reply = response.get("resposta", response.get("message", "Sem resposta da IA"))
        
        # Exibe a resposta da IA
        st.session_state.messages.append({"role": "assistant", "content": reply})
        with st.chat_message("assistant"):
            st.markdown(reply)
    except Exception as e:
        st.error(f"Erro ao conectar: {e}")