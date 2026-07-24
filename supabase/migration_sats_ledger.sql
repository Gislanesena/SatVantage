-- Extrato real de sats (mentoria, saque voucher, envio NWC).
-- Rodar no SQL Editor do Supabase. Seguro repetir.

create table if not exists public.sats_ledger (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  kind         text not null check (kind in ('in', 'out', 'transfer')),
  amount_sats  integer not null check (amount_sats > 0),
  -- mission = crédito por pergunta; voucher = saque do saldo interno;
  -- wallet = pagamento Lightning via NWC (carteira conectada)
  source       text not null check (source in ('mission', 'voucher', 'wallet')),
  label        text not null default '',
  -- Chave opcional anti-duplicata (ex.: mission:primeiros-passos:2)
  ref_key      text,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists sats_ledger_user_created_idx
  on public.sats_ledger (user_id, created_at desc);

-- Uma entrada por ref_key por usuário (quando ref_key não é nulo)
create unique index if not exists sats_ledger_user_ref_uidx
  on public.sats_ledger (user_id, ref_key)
  where ref_key is not null;

alter table public.sats_ledger enable row level security;

drop policy if exists "ledger: dono lê" on public.sats_ledger;
create policy "ledger: dono lê"
  on public.sats_ledger for select
  using (auth.uid() = user_id);

-- Escrita só via service role nas API routes (sem policy de insert para o cliente).

comment on table public.sats_ledger is
  'Movimentações de sats do usuário: créditos de mentoria, saques e envios Lightning.';
