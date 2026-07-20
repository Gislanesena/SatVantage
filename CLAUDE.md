# CLAUDE.md — Contexto do Projeto SatVantage

> Leia este arquivo inteiro antes de qualquer tarefa. Ele é a fonte da verdade do projeto.

## Idioma

**Responda SEMPRE em português brasileiro.** O dono do projeto (André) prefere explicações calmas, um passo de cada vez, sem jargão técnico não explicado.

---

## O que é o SatVantage

Plataforma de educação, proteção e acompanhamento da vida financeira em Bitcoin, focada no brasileiro iniciante. Tese: a barreira do Bitcoin é cognitiva e emocional, não tecnológica — exchanges lucram com giro emocional em vez de educar. O SatVantage ensina, recompensa aprendizado com Bitcoin real (sats via Lightning), protege o usuário dele mesmo (fricção comportamental) e organiza sucessão familiar.

**Contexto de hackathon (Hack4Freedom Brasil):**
- Entrega: 24/07/2026 até 12h via GitHub. Demo Day: 25/07 14h, pitch de 5 min.
- Requisito obrigatório: link de teste FUNCIONANDO ao vivo (deploy planejado dia 21/07).
- Critérios: problema 20% + solução 25% + impacto social 25% (70% = narrativa humana/brasileira); inovação vale só 10%.
- Metas: pódio geral + Prêmio Nostr US$1.000 (jurados da Soapbox).
- Papéis: André = front, back, API, integrações Bitcoin. Dupla = agentes de IA (Python/FastAPI, repositório separado, integração via HTTP/JSON).

## Stack

- **Next.js 14 (App Router) + TypeScript** — front e API routes (pasta `web/`)
- **Supabase (Postgres + RLS)** — banco; acesso só via service role nas API routes
- **Voltage Payments API** — pagamentos Lightning (tesouraria), rede **MutinyNet**
- **nostr-tools** — identidade/login (NIP-07 e cofre)
- **light-bolt11-decoder** — validação de invoices
- Agentes de IA: FastAPI da dupla (NÃO fica neste repositório; chamadas via `AGENTS_API_URL`)

## Arquitetura de identidade (SISTEMA ENCERRADO — NÃO MODIFICAR)

O login está validado e testado. Não alterar sem pedido explícito do André:
- Toda conta é um par de chaves Nostr real. Dois caminhos: iniciante (usuário+senha) e especialista (extensão NIP-07).
- Iniciante: chave privada cifrada NO NAVEGADOR (PBKDF2 600k + AES-256-GCM) com a senha do usuário → servidor guarda só o cofre ("guardamos o cofre, nunca a chave"). Arquivo: `web/lib/vault.ts`.
- Recuperação de senha: prova por assinatura (nsec) + pergunta de segurança (hash no cliente), as duas juntas. Sem e-mail, zero dado pessoal.
- Sessão: JWT assinado com SUPABASE_JWT_SECRET, sub = users.id → auth.uid() → RLS funciona nativamente.
- Anti-replay: challenges de uso único com validade 60s, consumo atômico.
- Endpoints: `api/auth/{challenge,login,register,vault,recovery-info,recover}`.

## Gamificação (modelo VOUCHER — decisão fechada)

- Missão 1 "Primeiros Passos no Bitcoin": quiz 5 perguntas (gabarito só no servidor, `web/lib/quiz.ts`), 4 acertos para passar → +50 XP + 100 sats creditados no **saldo interno** (`users.sats_balance`).
- Iniciante NUNCA vê invoice/carteira/jargão — os sats aparecem como saldo na conta ("atrelados à chave").
- Resgate para carteira própria fica TRANCADO até concluir a Missão 2 "Sua Primeira Carteira" (slug `primeira-carteira`). Existe atalho de demo: `POST /api/demo/unlock` (REMOVER no produto final, manter no hackathon).
- Resgate: usuário cola invoice `lntbs...` do valor EXATO do saldo → Tesouraria paga via Voltage. Travas: rede de teste obrigatória, valor exato, zera saldo antes de pagar com estorno se falhar.
- Regra de ouro: **IA nunca decide pagamento.** Agentes ensinam/avaliam; quem conclui missão e paga é sempre o backend.

## Estado atual (17-18/07)

✅ Pronto e testado: login completo (2 caminhos + recuperação), banco com RLS (9 tabelas + migrações vault/voucher), carteiras Voltage MutinyNet criadas (Tesouraria com crédito 500K sats + Carteira Jurado), primeiro pagamento Lightning manual validado no painel.
🔶 Entregue, teste final pendente: fluxo de resgate ponta a ponta (quiz → voucher → unlock demo → resgate pagando a Carteira Jurado). **Ponto de atenção: o formato exato da chamada em `web/lib/voltage.ts` (POST /organizations/{org}/environments/{env}/payments) foi escrito a partir da documentação e pode precisar de ajuste — se der 4xx, ler o corpo do erro logado no terminal e conferir https://voltageapi.com/v1/docs antes de mudar o código.**

## Roadmap (ordem de prioridade)

1. Validar resgate ponta a ponta (em andamento)
2. **NWC** (Nostr Wallet Connect): conectar carteira própria do usuário, ler saldo/histórico — segredo NWC cifrado com `web/lib/crypto.ts` (AES-GCM, chave em NWC_ENCRYPTION_KEY), coluna `nwc_connections.connection_secret_enc`
3. **Fricção comportamental** (CORAÇÃO DA DEMO): usuário inicia envio pelo SatVantage → backend calcula desvio do padrão histórico (matemática no código, LLM só redige o texto) → modal educativo ANTES de executar → usuário decide (nunca bloquear) → pagamento via NWC
4. **Herança**: herdeiros (npub + %) + documento + hash SHA-256 + OpenTimestamps (trigger de 100% já existe no banco)
5. **Modo Emergência**: apagar segredos NWC do banco (revogar = deletar, não flag) + invalidar conexões + tela de recuperação
6. Integração agentes da dupla (`/mentor` no quiz, `/comportamental` no envio) + seed de dados sintéticos de aportes (sem histórico a fricção não tem base de comparação)
7. Deploy dia 21/07 (Vercel + agentes em Railway/Render) — requisito obrigatório
8. Dia 22: code freeze, vídeo da demo (plano B), carimbos OTS antecipados (confirmação leva horas)
9. Extra SE sobrar prazo: publicar evento de missão num relay Nostr público com link "verifique você mesmo" (mira o Prêmio Nostr)

## 🚫 REGRAS INVIOLÁVEIS

1. **NUNCA usar mainnet.** Tudo é MutinyNet/rede de teste. Invoices mainnet (lnbc...) devem ser recusados pelo código. Não trocar rede sem ordem explícita do André.
2. **NUNCA ler, imprimir, logar ou commitar o conteúdo de `.env.local`** ou qualquer segredo (API keys, macaroons, chaves privadas, strings NWC, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET, NWC_ENCRYPTION_KEY, VOLTAGE_API_KEY). Referencie variáveis apenas pelo NOME. Se precisar diagnosticar env, verifique apenas se a variável EXISTE, nunca seu valor.
3. **`.gitignore` deve sempre cobrir `.env*.local`** — conferir antes de qualquer commit. Jamais commitar segredos; se encontrar segredo commitado, avisar o André imediatamente.
4. **Não modificar o sistema de login/cofre/recuperação** (encerrado e validado) sem pedido explícito.
5. **Não remover as travas de segurança** dos endpoints (anti-replay, anti-duplo-resgate, valor exato, verificação de rede, verificação de assinatura, RLS) nem "simplificar" removendo validações.
6. **Chave privada de usuário nunca existe no servidor em claro.** Qualquer código novo deve manter esse princípio.
7. **Supabase service role só em código de servidor** (API routes/lib) — nunca em componentes de cliente.
8. **Não instalar dependências pesadas ou trocar stack** (nada de Rust, Docker, novos frameworks) — hackathon com prazo 24/07.
9. **Não fazer deploy, push forçado, nem apagar branches/migrações** sem confirmação do André.
10. **Prompts para os agentes de IA**: nunca incluir npub, nome de usuário ou dados pessoais — só dados numéricos/anônimos.

## Variáveis de ambiente (nomes; valores estão no .env.local do André)

SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET, NWC_ENCRYPTION_KEY, VOLTAGE_API_KEY, VOLTAGE_ORG_ID, VOLTAGE_ENV_ID, VOLTAGE_TREASURY_WALLET_ID, AGENTS_API_URL (futuro), LNBITS_* (legado, não usado — Voltage substituiu o plano LNbits)

## Comandos úteis

- Rodar: `cd web && npm run dev` (localhost:3000)
- Banco: migrações em `supabase/*.sql`, rodadas manualmente no SQL Editor do Supabase (ordem: schema.sql → migration_login.sql → migration_voucher.sql)
- Teste do fluxo principal: login → quiz Missão 1 → ver saldo ⚡ → [demo] unlock → invoice de 100 sats na Carteira Jurado (painel Voltage) → colar → Resgatar

## Estilo de trabalho

- Mudanças pequenas e incrementais; explicar O QUE mudou e POR QUÊ em linguagem simples.
- Antes de mexer em área nova, ler os arquivos existentes — há decisões de segurança deliberadas em cada validação.
- Em dúvida entre "elegante" e "entregável até 24/07": entregável.
