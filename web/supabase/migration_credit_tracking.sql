-- ============================================================
-- SatVantage — Crédito de sats por pergunta (rodar 1x no SQL Editor)
-- Sem isso, sats de perguntas já respondidas se perdiam se a
-- mentoria não fosse concluída até o fim (refresh/queda no meio).
-- ============================================================

alter table public.user_missions
  add column if not exists credited_ids text[] not null default '{}';
