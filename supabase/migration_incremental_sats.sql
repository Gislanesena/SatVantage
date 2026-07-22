-- SatVantage — crédito incremental de sats por pergunta da mentoria.
-- Rode no SQL Editor do Supabase. Seguro repetir (IF NOT EXISTS).
--
-- Motivo: antes, os sats só eram gravados quando a mentoria inteira
-- terminava (POST /api/missions/submit). Qualquer interrupção no meio
-- perdia tudo. Agora cada resposta credita na hora (POST /api/missions/check),
-- e estas colunas guardam QUAIS perguntas já foram creditadas, para não
-- gerar sats de novo se o usuário responder a mesma pergunta outra vez
-- (ex.: depois de um F5 que reinicia a conversa do zero).

alter table public.user_missions
  add column if not exists progress jsonb not null default '{}'::jsonb,
  add column if not exists sats_credited bigint not null default 0 check (sats_credited >= 0);

comment on column public.user_missions.progress is
  'Índices de pergunta já creditados nesta missão: {"0": {"sats":5,"correct":true}, ...}. Evita crédito duplicado ao responder de novo (ex.: após F5).';
comment on column public.user_missions.sats_credited is
  'Soma de sats já creditados a esta missão para este usuário (idempotência/depuração; espelha o que entrou em users.sats_balance por esta missão).';
