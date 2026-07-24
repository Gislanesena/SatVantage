"""
Entrypoint legado do Streamlit.

Preferível:  streamlit run app/app.py
Mantido para compatibilidade com `streamlit run app.py`.
"""

from pathlib import Path

import runpy

_TARGET = Path(__file__).resolve().parent / "app" / "app.py"
runpy.run_path(str(_TARGET), run_name="__main__")
