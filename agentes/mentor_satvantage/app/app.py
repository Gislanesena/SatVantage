"""
Cliente Streamlit do Mentor SatVantage.

Uso: streamlit run app/app.py
(a partir da pasta mentor_satvantage)
"""

from __future__ import annotations

import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000/api/api/interact"

st.title("Mentor SatVantage")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Como posso te ajudar hoje?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Contrato de /interact: messages[{role, content}], não mensagem_usuario.
    payload = {
        "messages": st.session_state.messages,
        "missao_id": None,
        "tema_atual": "Bitcoin",
    }

    try:
        response = requests.post(API_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        reply = data.get("resposta") or data.get("message") or data.get("feedback") or "Sem resposta da IA"
        st.session_state.messages.append({"role": "assistant", "content": reply})
        with st.chat_message("assistant"):
            st.markdown(reply)
    except requests.RequestException as exc:
        st.error(f"Erro ao conectar: {exc}")
