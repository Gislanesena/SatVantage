# Checklist de Validação Pré-Deploy — SatVantage

Atualizado em 2026-07-24 após smoke + Playwright + build.  
Relatório completo: [`AUDIT_REPORT.md`](./AUDIT_REPORT.md)

Legenda: `PASS` · `WARN` · `FAIL` · `SKIP`

---

## A. Rotas

| ID | Item | Status |
|----|------|--------|
| A1 | `/` Landing SPA | PASS |
| A2 | `/heranca/checkin-ok` | PASS (build) |
| A3 | `/heranca/verificar/[planId]` | PASS (build) |
| A4 | `GET /api/market/btc` | PASS |
| A5 | `POST /api/agents/*` | PASS |
| A6 | Auth APIs | PASS (session 200; demais no build) |
| A7 | Missions | PASS (401 sem sessão) |
| A8 | Wallet | SKIP (auth) |
| A9 | Rewards | PASS (401 sem sessão) |
| A10 | Extension analisar | PASS |
| A11 | Herança / emergency / vault | PASS (build) |

## B. Chat NagAI

| ID | Item | Status |
|----|------|--------|
| B1 | Envio de mensagens | PASS |
| B2 | Auto-scroll inteligente | PASS |
| B3 | Escopo Bitcoin | PASS |
| B4 | Cotação tempo real | PASS |
| B5 | Ano 2026 | PASS |
| B6 | Histórico | PASS* |
| B7 | FreeTopicChat | PASS* |

## C. Simulador de Trade

| ID | Item | Status |
|----|------|--------|
| C1–C6 | Tooltips, required, tour, ações | PASS* (contrato estático; E2E logado SKIP) |

## D. Acessibilidade

| ID | Item | Status |
|----|------|--------|
| D1 | Dock flutuante | PASS |
| D2 | TTS Ler/Pausar/Parar | PASS (botões no DOM) |
| D3 | VLibras mobile acima do dock | WARN (CDN/headless) |
| D4 | Símbolo Universal | PASS |
| D5 | Sem TTS em bolhas | PASS |

## E. Extensão

| ID | Item | Status |
|----|------|--------|
| E1 | Side Panel FastAPI (`../extension`) | PASS |
| E2 | Side Panel Next (`front/extension`) | PASS |
| E3 | Oficial / phishing | PASS* |
| E4 | Análise de página | PASS* |
| E5 | Captura de tela | PASS |
| E6 | Cotação BTC | PASS* |

## F. Build / testes

| ID | Item | Status |
|----|------|--------|
| F1 | `npm run build` | PASS |
| F2 | Smoke (`test:smoke`) | PASS 21/21 |
| F3 | Playwright (`test:e2e`) | PASS 6/6 |

\*Validação de código/API; fluxo Chrome autenticado recomenda checagem manual.
