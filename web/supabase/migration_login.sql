-- ============================================================
-- SatVantage — Migração consolidada do LOGIN (rodar 1x no SQL Editor)
-- Adiciona à tabela users: conta simples (cofre cifrado) e
-- pergunta de segurança (resposta hasheada NO CLIENTE).
-- Seguro rodar mesmo se parte já existir (IF NOT EXISTS em tudo).
-- ============================================================

alter table public.users add column if not exists username text unique;
alter table public.users add column if not exists vault_nsec_enc text;        -- nsec cifrada no navegador (AES-GCM)
alter table public.users add column if not exists vault_salt text;            -- salt do PBKDF2 do cofre
alter table public.users add column if not exists security_question text;     -- pergunta escolhida pelo usuário
alter table public.users add column if not exists security_answer_hash text;  -- hash da resposta (feito no navegador)
alter table public.users add column if not exists qa_salt text;               -- salt do hash da resposta

create index if not exists users_username_idx on public.users (lower(username));
