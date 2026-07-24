@echo off
start cmd /k "venv\Scripts\activate && python -m uvicorn app.main:app --reload"
start cmd /k "venv\Scripts\activate && streamlit run app.py"