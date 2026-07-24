# Melhorias do Agente IA — SatVantage

Documento de diagnóstico + plano. Foco: mentor Bitcoin eficaz, integrado ao chat de mentoria existente, com sats e voz.

**Contexto do produto:** SatVantage ensina autocustódia, Bitcoin, corretoras e carteiras; mentoria pós-cadastro (ensinar → perguntar → creditar sats); chat NagAI / FreeTopic; extensão Copiloto. O agente **não** custodia chaves e **não** dá conselho financeiro genérico fora do escopo Bitcoin.

---

## 1. O que a pasta `agentes/` é (e o que não é)

O que veio do commit `e03b8b8` / branch `backup-agentes-gislane` **não é um agente pronto sozinho**. São duas peças incompletas:

| Peça | Onde | Estado |
|------|------|--------|
| Snapshot do front (Next) | `agentes/` e `agentes/web/` | Cópia parcial do app; **não** use como app paralelo |
| Backend FastAPI (mentor) | só no git `origin/backup-agentes-gislane` (`app/api/mentor/…`, `llm_service.py`) | **Não está nesta pasta** — precisa ser restaurado/copiado |
| Patch do chat | `MentorChat.tsx` apontando para `http://127.0.0.1:8000/api/api/mentor` | Quebra o fluxo atual de missões/sats |

No projeto **atual** (fora de `agentes/`):
- Mentoria já funciona com quiz determinístico (`lib/quiz.ts` + `/api/missions/*`).
- Sats já existem: **5 acerto / 3 tentativa / 0 pular** (`SATS_CORRECT` / `SATS_TRIED`).
- Crédito incremental em `/api/missions/check` + fechamento em `/api/missions/submit`.
- `AGENTS_API_URL` já é usado em `lib/comportamental.ts` e na extensão (`/comportamental`, análise).

**Problema central do patch da Bruna:** o chat deixou de chamar `/api/missions` e `/api/missions/check|submit` e passou a falar só com o FastAPI. Assim a IA “responde”, mas **não credita sats no usuário logado**, não grava `user_missions`, e some a trilha ensinar→perguntar do `quiz.ts`.

---

## 2. O que falta para funcionar de forma eficaz

### P0 — Obrigatório (sem isso não é “bom”)

1. **Restaurar o backend FastAPI** numa pasta clara, ex.: `agents-api/` na raiz do monorepo (código de `backup-agentes-gislane`), com:
   - `GET /health`
   - `POST /comportamental` (já esperado pelo Next)
   - `POST /mentor` e `POST /interact` (chat + classificação)
   - CORS só para origem do app (localhost + Vercel)
   - Prefixo limpo: `/api/...` (evitar `/api/api`)

2. **Integrar sem substituir o fluxo de sats**  
   O Next continua dono de: sessão Nostr, `userId`, `quiz.ts`, crédito 5/3, anti-farm.  
   O FastAPI só: gera texto pedagógico, classifica resposta aberta, redige alertas.  
   Nunca creditar sats só porque a IA disse “APROVADO” sem passar por `/api/missions/check`.

3. **System prompt de escopo (guardrail)**  
   Só: Bitcoin, satoshis, Lightning (didático), corretoras (custódia vs autocustódia), carteiras de autocustódia, seed/chave, golpes clássicos, como criar carteira e quais recomendar (lista curada).  
   Recusar: outros temas, day trade, “garantia de lucro”, pedir seed, custodiar chave.

4. **Conteúdo de carteiras recomendadas (lista oficial no prompt + opcional no `quiz`/`optional-topics`)**  
   Exemplos didáticos (ajustar à política do produto):
   - Iniciante mobile: **BlueWallet**, **Muun** (cuidado com trade-offs de cada uma)
   - Desktop / avançado: **Sparrow**, **Electrum**
   - Hardware (fria): **Coldcard**, **BitBox**, **Trezor** (mencionar quando falar de carteira fria)
   - Sempre: anotar seed offline, nunca foto na nuvem, nunca enviar seed a “suporte”

5. **Mensagem clara de sats por resposta**  
   Após cada acerto/erro no chat:
   - Acerto: *“Você acertou — creditamos **5 sats** na sua conta SatVantage.”*
   - Tentativa errada: *“Quase — mesmo assim você ganha **3 sats** por ter tentado.”*
   - No fim: total da conversa + saldo (já parcialmente existe; reforçar o breakdown 5/3).

6. **Variáveis de ambiente**  
   - Next: `AGENTS_API_URL=https://...` (prod) ou `http://127.0.0.1:8000` (dev)  
   - FastAPI: `HF_TOKEN` (ou migrar para Anthropic/OpenAI se preferirem estabilidade)  
   - Remover URL hardcoded `127.0.0.1` do `MentorChat` — usar rotas Next que fazem proxy ao agente

### P1 — Qualidade do mentor

7. **Fluxo híbrido mentoria pós-cadastro**  
   Manter lições de `quiz.ts` (ensinam + múltipla escolha + sats).  
   Opcional: depois de cada `teach`, o agente pode **reformular** o texto no tom do usuário (mesmo conteúdo, sem inventar fatos).  
   Perguntas continuam com gabarito no servidor.

8. **Chat livre (FreeTopic / NagAI)**  
   Proxy Next → FastAPI com o mesmo system prompt + histórico curto.  
   Fallback local se agente cair (como `comportamental.ts`).

9. **Memória de conversa**  
   Enviar últimas N mensagens no body; ou session id no backend. Hoje o FastAPI é stateless e “esquece” o contexto.

10. **Nível de conhecimento**  
    Usar `knowledgeLevel` real do usuário (iniciante/intermediário/avançado) no body — o patch atual manda sempre `"iniciante"`.

11. **Filtro de escopo melhor que keyword**  
    O `llm_service` atual bloqueia por palavras (“bitcoin”, “carteira”…). Frágil (bloqueia perguntas válidas sem a palavra; deixa passar lixo com “bitcoin” no meio). Preferir system prompt + classificador APROVADO / REPROVADO / FORA_DE_ESCOPO.

### P2 — Produção / demo

12. Deploy do FastAPI (Railway/Fly/Render) + `AGENTS_API_URL` no Vercel  
13. Timeout curto (4–8s) + fallback  
14. Logs sem PII (sem npub, sem seed)  
15. Testes: escopo, sats 5/3, anti-farm, agente offline  

---

## 3. Microfone de voz (speech-to-text) — fácil e prático

### Objetivo
Botão de microfone no composer do `MentorChat` / `FreeTopicChat`: a pessoa fala em português e o texto vai para o campo (ou já envia como mensagem).

### Caminho mais simples (recomendado para demo)

Usar a **Web Speech API** do navegador (`SpeechRecognition` / `webkitSpeechRecognition`):

- Zero backend, zero chave, zero custo  
- Funciona bem no **Chrome / Edge** (desktop); suporte fraco no Safari/Firefox  
- Ideal para hackathon/demo  

**Como fazer (passos):**

1. No composer do chat, botão 🎤 ao lado do input.  
2. Ao clicar: pedir permissão de microfone; iniciar `recognition` com `lang: "pt-BR"`, `interimResults: true`.  
3. Enquanto fala: mostrar texto provisório no input.  
4. No evento `result` final: preencher o input (ou chamar o mesmo handler de “enviar”).  
5. Estados UI: ocioso / ouvindo / erro (“navegador sem suporte” / “microfone negado”).  
6. Parar no segundo clique ou após silêncio (`recognition.continuous = false` no início).  

**Snippet de referência (conceito):**

```ts
const Rec =
  typeof window !== "undefined" &&
  ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

if (!Rec) {
  // mostrar: "Voz disponível no Chrome/Edge"
} else {
  const r = new Rec();
  r.lang = "pt-BR";
  r.interimResults = true;
  r.onresult = (e: SpeechRecognitionEvent) => {
    const text = Array.from(e.results)
      .map((x) => x[0].transcript)
      .join("");
    setDraft(text);
  };
  r.start();
}
```

### Alternativa mais robusta (depois)

Se precisarem de mobile Safari ou qualidade melhor:
- **OpenAI Whisper** / **Deepgram** / **Google Speech-to-Text**: gravar áudio no browser (`MediaRecorder`) → `POST /api/voice/transcribe` (rota Next, chave só no servidor) → devolver texto.  
- Mais trabalho e custo; deixar como fase 2.

### Onde encaixar
- `components/MentorChat.tsx` (modo opções + se houver texto livre)  
- `components/FreeTopicChat.tsx` (input de dúvida)  
- Extensão Copiloto (opcional, mesmo padrão)

**Não** enviar áudio ao FastAPI do mentor na v1 — só texto. Mantém o contrato atual.

---

## 4. Outras melhorias necessárias (checklist)

- [ ] Extrair backend Python para `agents-api/` (não misturar com snapshot Next em `agentes/`)  
- [ ] Proxy Next: `/api/agents/mentor`, `/api/agents/interact`, reusando sessão cookie  
- [ ] Remover `127.0.0.1` hardcoded do front  
- [ ] Alinhar resposta do `/interact` com o que o `MentorChat` espera (`feedback`, `correct`, `satsCredited`, `satsBalance`)  
- [ ] Feedback imediato: “+5 sats” / “+3 sats” na bolha do mentor  
- [ ] Expandir mentoria 2 / tópicos: passo a passo “criar carteira” + lista recomendada  
- [ ] Prompt comportamental alinhado ao tom SatVantage (empático, sem alarmismo vazio)  
- [ ] Microfone Web Speech API  
- [ ] Documentar no README: subir Next + `agents-api` + `.env`  
- [ ] Não versionar `.env` real nem `HF_TOKEN`  
- [ ] Decidir modelo: Llama via HF vs Anthropic (estabilidade na demo)

---

## 5. Arquitetura alvo (integração)

```
Usuário (MentorChat / FreeTopic)
        │
        ▼
Next.js  /api/missions/*     → quiz + sats + Supabase (fonte da verdade)
         /api/agents/*       → proxy autenticado
        │
        ▼
FastAPI  AGENTS_API_URL
         /mentor   → texto pedagógico (escopo Bitcoin)
         /interact → classifica / responde dúvida
         /comportamental → redige alerta de envio atípico
```

Regra de ouro: **IA redige e ensina; o Next decide sats e persistência.**

---

## 6. Prompt pronto — mexer SÓ no agente + integração no chat

Copie e cole em um chat novo do Cursor (neste repo):

```
ESCopo estrito: trabalhar APENAS a integração do Agente IA com o chat de mentoria SatVantage.
NÃO refatorar dashboard, herança, extensão, login Nostr, nem UI fora do mentor/chat livre — salvo o mínimo necessário para o microfone e mensagens de sats.

Contexto do produto:
- SatVantage ensina Bitcoin, corretoras, carteiras de autocustódia, golpes; não custodia chaves.
- Mentoria pós-cadastro: ensinar → perguntar → creditar sats no userId logado.
- Regras de sats (já no código): acerto = 5, tentativa errada = 3, pular = 0. Anti-farm: só primeira conclusão conta.
- Backend esperado em AGENTS_API_URL (FastAPI da dupla). Código de referência em origin/backup-agentes-gislane (mentor_router, mentor_logic, llm_service). Snapshot quebrado em agentes/MentorChat (URL 127.0.0.1 e bypass de /api/missions) — NÃO copiar esse bypass.

Objetivos (implementar nesta ordem):

1) Restaurar/organizar agents-api/ (FastAPI) a partir de backup-agentes-gislane:
   - Rotas limpas sob /api (sem /api/api).
   - System prompt forte: SÓ Bitcoin, satoshis, Lightning didático, corretoras (custódia vs self-custody), carteiras autocustódia, seed, golpes; ensinar a criar carteira e citar recomendações curadas (BlueWallet/Muun iniciante; Sparrow/Electrum desktop; hardware para fria). Recusar fora de escopo.
   - Endpoints: /health, /mentor, /interact, /comportamental (contrato compatível com lib/comportamental.ts).
   - CORS + HF_TOKEN (ou ANTHROPIC se já houver padrão no projeto). Fallback de texto se LLM falhar.

2) Integração no Next (sem tirar o quiz/sats):
   - Criar proxy /api/agents/mentor e /api/agents/interact (server-side, usa AGENTS_API_URL + sessão).
   - MentorChat continua carregando lições de /api/missions e validando com /api/missions/check + submit.
   - Opcional: após teach do quiz, pedir ao agente para reformular o mesmo conteúdo (não inventar fatos).
   - Em FreeTopicChat / dúvidas: enviar mensagem ao proxy; se agente offline, fallback local (optional-topics).
   - Remover qualquer fetch hardcoded para 127.0.0.1:8000 no front.

3) UX de sats na mentoria:
   - Depois de cada /api/missions/check, o mentor deve dizer explicitamente:
     acerto → "Você acertou — creditamos 5 sats na sua conta."
     erro → "Você tentou — creditamos 3 sats na sua conta."
   - No fim, total creditado nesta conversa + saldo (já existe parcialmente; completar breakdown).

4) Microfone (speech-to-text) — implementação FÁCIL:
   - Web Speech API (pt-BR) no composer de FreeTopicChat e, se houver input texto, MentorChat.
   - Botão microfone: ouvir → preencher o campo de texto. Sem backend na v1.
   - Se navegador sem suporte, tooltip amigável (Chrome/Edge).
   - Não gravar/enviar áudio ao FastAPI nesta fase.

5) Conteúdo:
   - Garantir que mentoria/tópicos cubram: o que é Bitcoin, corretora vs autocustódia, como criar carteira, quais recomenda, como funciona seed/Lightning em linguagem simples.
   - Preferir editar lib/quiz.ts e lib/optional-topics.ts para conteúdo factual; agente só redige/classifica.

Restrições:
- Não apagar o sistema de missões/sats existente.
- Não creditar sats no FastAPI — só no Next/Supabase.
- Não commitar .env com secrets.
- Diff mínimo; seguir padrões do repo.
- Ao terminar: README curto em agents-api/ (como subir) + checklist de teste manual (mentoria 5/3, fora de escopo, agente offline, microfone no Chrome).

Leia antes: agentes/MELHORIAS-AGENTE.md, lib/quiz.ts, components/MentorChat.tsx, app/api/missions/check/route.ts, lib/comportamental.ts, e o código em origin/backup-agentes-gislane:app/.
```

---

## 7. Teste manual rápido (depois de implementar)

1. Subir `agents-api` + Next com `AGENTS_API_URL`.  
2. Conta nova → mentoria 1 → acertar 1 pergunta → ver “5 sats” + saldo sobe.  
3. Errar 1 → ver “3 sats”.  
4. Perguntar “receita de bolo” no chat livre → recusa educada.  
5. Perguntar “como criar carteira BlueWallet?” → resposta no escopo.  
6. Parar o FastAPI → mentoria quiz ainda funciona (fallback).  
7. Chrome: microfone preenche o input em pt-BR.
