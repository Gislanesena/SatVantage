-- ============================================================
-- BitcoinOS — Schema Supabase (Postgres + Row Level Security)
-- Rodar no SQL Editor do Supabase.
-- Convenção: o JWT de sessão carrega sub = users.id, então
-- auth.uid() = id do usuário logado e o RLS funciona nativamente.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- USUÁRIOS (identidade = par de chaves Nostr)
-- ------------------------------------------------------------
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  pubkey        text not null unique,          -- hex (32 bytes), forma canônica
  npub          text not null unique,          -- bech32, só para exibição
  display_name  text,
  knowledge_level text not null default 'iniciante'
                 check (knowledge_level in ('iniciante','intermediario','avancado')),
  xp            integer not null default 0,
  is_demo       boolean not null default false, -- identidade de demonstração (fallback)
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DESAFIOS DE LOGIN (anti-replay)
-- Sem política RLS: só o service role acessa.
-- ------------------------------------------------------------
create table public.auth_challenges (
  challenge   text primary key,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  used        boolean not null default false
);

-- ------------------------------------------------------------
-- CONEXÕES NWC (carteira própria do usuário)
-- O segredo NUNCA é gravado em claro: AES-256-GCM no app.
-- Modo Emergência: apagar connection_secret_enc e marcar revoked_at.
-- ------------------------------------------------------------
create table public.nwc_connections (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  label                  text not null default 'Minha carteira',
  connection_secret_enc  text,                 -- base64(iv || ciphertext || tag)
  created_at             timestamptz not null default now(),
  revoked_at             timestamptz
);

-- ------------------------------------------------------------
-- APORTES / OPERAÇÕES (base da IA Comportamental)
-- Semear dados sintéticos de 6 meses antes da demo!
-- ------------------------------------------------------------
create table public.aportes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  kind        text not null check (kind in ('compra','venda','transferencia')),
  amount_brl  numeric(14,2) not null check (amount_brl > 0),
  amount_sats bigint,
  source      text not null default 'mock_exchange',  -- mock_exchange | nwc
  is_seed     boolean not null default false,          -- dado sintético de demo
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- GAMIFICAÇÃO (missões + progresso + recompensa em sats)
-- ------------------------------------------------------------
create table public.missions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  xp_reward    integer not null default 10,
  sats_reward  integer not null default 0,
  unlocks      text  -- recurso que a missão desbloqueia (ex: 'autocustodia')
);

create table public.user_missions (
  user_id       uuid not null references public.users(id) on delete cascade,
  mission_id    uuid not null references public.missions(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  lnurl_withdraw text,          -- link de saque gerado no LNbits
  withdrawn_at  timestamptz,
  primary key (user_id, mission_id)
);

-- ------------------------------------------------------------
-- HERANÇA (plano sucessório + prova OpenTimestamps)
-- ------------------------------------------------------------
create table public.inheritance_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  status       text not null default 'rascunho'
               check (status in ('rascunho','carimbado','revisao')),
  doc_sha256   text,           -- hash hex do PDF do plano
  ots_receipt  text,           -- recibo .ots em base64
  stamped_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.heirs (
  id        uuid primary key default gen_random_uuid(),
  plan_id   uuid not null references public.inheritance_plans(id) on delete cascade,
  name      text not null,
  npub      text,             -- identidade Nostr do herdeiro (DM criptografada)
  percent   numeric(5,2) not null check (percent > 0 and percent <= 100)
);

-- Soma dos percentuais não pode passar de 100 (validação de furo!)
create or replace function public.check_heirs_percent()
returns trigger language plpgsql as $$
declare total numeric;
begin
  select coalesce(sum(percent),0) into total
  from public.heirs where plan_id = new.plan_id and id is distinct from new.id;
  if total + new.percent > 100 then
    raise exception 'Soma dos percentuais dos herdeiros excede 100%% (atual: %)', total;
  end if;
  return new;
end $$;

create trigger heirs_percent_check
  before insert or update on public.heirs
  for each row execute function public.check_heirs_percent();

-- ------------------------------------------------------------
-- MODO EMERGÊNCIA (auditoria do que foi revogado)
-- ------------------------------------------------------------
create table public.emergency_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  triggered_at  timestamptz not null default now(),
  actions       jsonb not null default '[]'::jsonb  -- ["nwc_revogado","apis_invalidadas",...]
);

-- ============================================================
-- ROW LEVEL SECURITY — o "isolamento de contexto" de verdade
-- ============================================================
alter table public.users             enable row level security;
alter table public.auth_challenges   enable row level security;  -- sem policy: só service role
alter table public.nwc_connections   enable row level security;
alter table public.aportes           enable row level security;
alter table public.missions          enable row level security;
alter table public.user_missions     enable row level security;
alter table public.inheritance_plans enable row level security;
alter table public.heirs             enable row level security;
alter table public.emergency_events  enable row level security;

-- Usuário lê/edita só a si mesmo
create policy users_self_select on public.users
  for select using (id = auth.uid());
create policy users_self_update on public.users
  for update using (id = auth.uid());

-- Padrão: dono da linha (user_id = auth.uid())
create policy nwc_owner on public.nwc_connections
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy aportes_owner on public.aportes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy user_missions_owner on public.user_missions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy plans_owner on public.inheritance_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Herdeiros: via posse do plano
create policy heirs_owner on public.heirs
  for all using (
    exists (select 1 from public.inheritance_plans p
            where p.id = plan_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.inheritance_plans p
            where p.id = plan_id and p.user_id = auth.uid())
  );

create policy emergency_owner on public.emergency_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Missões são catálogo público (leitura para qualquer logado)
create policy missions_read on public.missions
  for select using (true);

-- ------------------------------------------------------------
-- SEED mínimo de missões
-- ------------------------------------------------------------
insert into public.missions (slug, title, description, xp_reward, sats_reward, unlocks) values
 ('primeiros-passos', 'O que é Bitcoin?', 'Complete a conversa introdutória com o Mentor.', 20, 21, null),
 ('lab-autocustodia', 'Laboratório de autocustódia', 'Simule uma transferência para carteira própria sem errar.', 50, 100, 'autocustodia'),
 ('anti-golpe', 'Caça ao phishing', 'Identifique 3 golpes no simulador do Cyber Shield.', 30, 50, null);
