-- ============================================================
-- Herança — Prova documental + Prova de vida (André: rodar no Supabase)
-- SatVantage NÃO custodia chaves nem move bitcoins na herança.
-- ============================================================

-- Prova de vida do titular
alter table public.inheritance_plans add column if not exists last_checkin_at timestamptz default now();
alter table public.inheritance_plans add column if not exists checkin_interval_days integer not null default 90;
alter table public.inheritance_plans add column if not exists triggered_at timestamptz;
alter table public.inheritance_plans add column if not exists titular_email text;
alter table public.inheritance_plans add column if not exists last_reminder_sent_at timestamptz;
alter table public.inheritance_plans add column if not exists reminder_stage integer not null default 0;
alter table public.inheritance_plans add column if not exists checkin_token uuid default gen_random_uuid();

-- status: incluiir 'ativado'
alter table public.inheritance_plans drop constraint if exists inheritance_plans_status_check;
alter table public.inheritance_plans add constraint inheritance_plans_status_check
  check (status in ('rascunho','carimbado','revisao','ativado'));

-- Contato dos herdeiros (múltiplos canais)
alter table public.heirs add column if not exists email text;
alter table public.heirs add column if not exists telefone text;
alter table public.heirs add column if not exists contacts_confirmed_at timestamptz default now();
alter table public.heirs add column if not exists notified_at timestamptz;

-- Índice para lookup do link público de check-in (sem login)
create unique index if not exists inheritance_plans_checkin_token_uidx
  on public.inheritance_plans (checkin_token)
  where checkin_token is not null;
