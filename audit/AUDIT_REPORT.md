# Relatório de Auditoria Pré-Deploy — SatVantage

**Data:** 2026-07-24  
**Escopo:** `front` (site) + extensões (`front/extension`, `satmentor/extension`)  
**Excluído:** qualquer alteração em `agents-api` (somente health-check HTTP)

---

## Veredito

| Pacote | Resultado |
|--------|----------|
| Smoke API + contratos estáticos | **21/21 PASS** |
| Build de produção (`npm run build`) | **PASS** (após limpar `.next`) |
| Playwright E2E | **6/6 PASS** (após ajuste VLibras CDN/headless) |
| Pronto para deploy? | **Condicional** — smoke/build ok; validar manualmente no Chrome a extensão (side panel + captura) e fluxos autenticados (wallet/missões) |

---

## Como reproduzir

```bash
cd front
npm run test:smoke          # scripts/smoke-audit.mjs
npx playwright test         # e2e/smoke.spec.ts
npm run build
```

Artefatos: `audit/SMOKE_RESULTS.json`, `audit/playwright-results.json`, `audit/VALIDATION_CHECKLIST.md`

---

## A. Rotas

| ID | Item | Status | Evidência |
|----|------|--------|-----------|
| A1 | Home `/` | **PASS** | GET 200 + E2E marca SatVantage |
| A2–A3 | Herança pages | **PASS*** | Incluídas no build (`/heranca/*`) |
| A4 | `GET /api/market/btc` | **PASS** | BRL≈332471 USD≈65215 |
| A5 | `POST /api/agents/mentor` | **PASS** | Resposta NagAI OK |
| A6 | Auth session | **PASS** | GET `/api/auth/session` → 200 |
| A7 | Missions overview | **PASS** | 401 sem sessão (esperado) |
| A8 | Wallet APIs | **SKIP** | Exigem sessão; presentes no build |
| A9 | Rewards balance | **PASS** | 401 sem sessão (esperado) |
| A10 | Extension analisar | **PASS** | POST → 200 |
| A11 | Emergency/herança/vault | **PASS*** | Rotas no build de produção |

\*Validação de presença no build; smoke autenticado não executado.

---

## B. Chat NagAI

| ID | Item | Status | Evidência |
|----|------|--------|-----------|
| B1 | Envio de mensagem | **PASS** | Proxy mentor respondeu (367+ chars) |
| B2 | Auto-scroll inteligente | **PASS** | Hook + uso em MentorChat/FreeTopicChat |
| B3 | Escopo Bitcoin | **PASS** | Off-topic → recusa/redireciona |
| B4 | Cotação tempo real | **PASS** | Cotação na resposta |
| B5 | Ano 2026 | **PASS** | “2026” na resposta de cotação/ano |
| B6 | Histórico drawer | **PASS*** | Componente presente (sem E2E logado) |
| B7 | FreeTopicChat | **PASS*** | Auto-scroll wired; UI no dashboard |

---

## C. Simulador de Trade

| ID | Item | Status | Evidência |
|----|------|--------|-----------|
| C1–C6 | Tooltips, required, tour targets, ações | **PASS*** | Contrato em `TradeSimulator.tsx` (equityTip, cashTip, btcTip, aria-required, data-tour-target) |
| — | Clique E2E na boleta | **SKIP** | Requer login + abrir NagAI → simulador |

---

## D. Acessibilidade

| ID | Item | Status | Evidência |
|----|------|--------|-----------|
| D1 | Dock flutuante | **PASS** | E2E botão “Opções de Acessibilidade” |
| D2 | TTS Ler página | **PASS** | E2E botão “Ler página em voz alta” |
| D3 | VLibras acima do dock | **WARN** | Código pin `bottom:140px` + smoke estático OK; DOM/CDN instável no Playwright headless |
| D4 | Símbolo universal | **PASS** | E2E FAB `.sv-a11y-fab` |
| D5 | Sem TTS em bolhas | **PASS** | Nenhum uso de `SpeakButton` nos components |

---

## E. Extensão

| ID | Item | Status | Evidência |
|----|------|--------|-----------|
| E1 | Side Panel MV3 (`satmentor/extension`) | **PASS** | manifest `side_panel` + heurísticas |
| E2 | Side Panel Next (`front/extension` 0.5.0) | **PASS** | manifest + popup.html |
| E3 | Oficial / phishing | **PASS*** | Heuristics + endpoint analisar 200 |
| E4 | Análise de página | **PASS*** | content scripts presentes |
| E5 | Captura de tela | **PASS** | `#capturar` / crop no popup.html |
| E6 | Cotação na extensão | **PASS*** | btn-btc / API market (runtime Chrome não automatizado) |

**Nota:** há **duas** árvores de extensão. Para produção Next/Vercel use `front/extension`. A pasta `satmentor/extension` fala com FastAPI (`/api/extension/chat`).

---

## F. Build / qualidade

| ID | Item | Status |
|----|------|--------|
| F1 | `npm run build` | **PASS** |
| F2 | Smoke 21 checks | **PASS** |
| F3 | Playwright 6 tests | **PASS** (após relaxar assert VLibras CDN) |

Primeira tentativa de build falhou por `.next` inconsistente (corrida com limpeza). Rebuild limpo → OK.

---

## Gaps / próximos passos manuais (pré-deploy)

1. Carregar `front/extension` no Chrome e validar side panel + captura em site real.  
2. Login Nostr → NagAI → Trade Simulator (tooltips hover + boleta).  
3. Mobile: confirmar VLibras visível acima do dock TTS.  
4. Decidir qual extensão oficial publicar (Next vs FastAPI).  
5. `npm audit` reportou vulnerabilidades em deps — revisar antes do go-live.

---

## Comandos adicionados

- `npm run test:smoke`
- `npm run test:e2e`
- `npm run audit` (smoke + e2e)
