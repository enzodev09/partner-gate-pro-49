-- Enable extensions needed for UUIDs (Supabase usually has pgcrypto enabled)
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ===============
-- TABLE: influencers
-- ===============
create table if not exists public.influencers (
  id uuid primary key, -- will match auth.users.id
  email text unique not null,
  username text unique not null,
  full_name text,
  social_instagram text,
  social_twitter text,
  social_facebook text,
  affiliate_link text,
  -- total_sales represents faturamento (valor total das vendas)
  total_sales numeric(12,2) not null default 0,
  total_commissions numeric(12,2) not null default 0,
  total_clicks integer not null default 0,
  -- total_sales_count represents quantidade de vendas
  total_sales_count integer not null default 0,
  pending_payment numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index for lookups by email/username
create index if not exists idx_influencers_email on public.influencers (email);
create index if not exists idx_influencers_username on public.influencers (username);

-- ===============
-- TABLE: sales (detailed per influencer)
-- ===============
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.influencers(id) on delete cascade,
  product text not null,
  customer text not null,
  value numeric(12,2) not null check (value >= 0),
  commission numeric(12,2) not null check (commission >= 0),
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sales_influencer on public.sales (influencer_id);
create index if not exists idx_sales_influencer_date on public.sales (influencer_id, date desc);

-- ===============
-- updated_at triggers (generic)
-- ===============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_updated_at_influencers
before update on public.influencers
for each row execute function public.set_updated_at();

create or replace trigger set_updated_at_sales
before update on public.sales
for each row execute function public.set_updated_at();

-- ===============
-- Aggregation triggers for sales → influencers metrics
-- ===============
create or replace function public.sales_after_insert()
returns trigger
language plpgsql
as $$
begin
  update public.influencers set
    total_sales = total_sales + new.value,
    total_commissions = total_commissions + new.commission,
    total_sales_count = total_sales_count + 1,
    -- pending_payment não é mais atualizado automaticamente por vendas
    updated_at = now()
  where id = new.influencer_id;
  return null;
end;
$$;

create or replace function public.sales_after_delete()
returns trigger
language plpgsql
as $$
begin
  update public.influencers set
    total_sales = greatest(total_sales - old.value, 0),
    total_commissions = greatest(total_commissions - old.commission, 0),
    total_sales_count = greatest(total_sales_count - 1, 0),
    -- pending_payment não é mais atualizado automaticamente por vendas
    updated_at = now()
  where id = old.influencer_id;
  return null;
end;
$$;

create or replace function public.sales_after_update()
returns trigger
language plpgsql
as $$
declare
  dv numeric;
  dc numeric;
begin
  if new.influencer_id <> old.influencer_id then
    -- Moveu a venda para outro influencer: remove do antigo
    update public.influencers set
      total_sales = greatest(total_sales - old.value, 0),
      total_commissions = greatest(total_commissions - old.commission, 0),
      total_sales_count = greatest(total_sales_count - 1, 0),
      -- pending_payment não é mais atualizado automaticamente por vendas
      updated_at = now()
    where id = old.influencer_id;

    -- adiciona no novo
    update public.influencers set
      total_sales = total_sales + new.value,
      total_commissions = total_commissions + new.commission,
      total_sales_count = total_sales_count + 1,
      -- pending_payment não é mais atualizado automaticamente por vendas
      updated_at = now()
    where id = new.influencer_id;
  else
    dv := coalesce(new.value,0) - coalesce(old.value,0);
    dc := coalesce(new.commission,0) - coalesce(old.commission,0);
    update public.influencers set
      total_sales = greatest(total_sales + dv, 0),
      total_commissions = greatest(total_commissions + dc, 0),
      -- total_sales_count não muda se o influencer não mudou
      -- pending_payment não é mais atualizado automaticamente por vendas
      updated_at = now()
    where id = new.influencer_id;
  end if;
  return null;
end;
$$;

create or replace trigger sales_ai
after insert on public.sales
for each row execute function public.sales_after_insert();

create or replace trigger sales_ad
after delete on public.sales
for each row execute function public.sales_after_delete();

create or replace trigger sales_au
after update on public.sales
for each row execute function public.sales_after_update();

-- ===============
-- RLS: Enable and secure policies (Option B: admin by email + self access)
-- ===============
alter table public.influencers enable row level security;
alter table public.sales enable row level security;

-- Remove permissive dev policies if present
drop policy if exists dev_influencers_all on public.influencers;
drop policy if exists dev_sales_all on public.sales;

-- Influencers: self can select own row; admin (by email) can select all
drop policy if exists influencers_self_select on public.influencers;
create policy influencers_self_select
on public.influencers
for select
to authenticated
using (id = auth.uid());

drop policy if exists influencers_admin_by_email on public.influencers;
create policy influencers_admin_by_email
on public.influencers
for select
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

-- Influencers: updates somente por admin (evita alteração indevida de métricas)
drop policy if exists influencers_admin_update on public.influencers;
create policy influencers_admin_update
on public.influencers
for update
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com')
with check ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

-- ===============
-- Trigger to auto-create influencer profile when a new Auth user is created
-- ===============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := split_part(new.email, '@', 1);
  insert into public.influencers (id, email, username, full_name, affiliate_link)
  values (new.id, new.email, base_username, null, 'https://hiveofclicks.com/ref/' || base_username)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- attach trigger on auth.users (built-in Supabase schema)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===============
-- Ajuste de pending_payment com saques pagos
-- ===============

-- Tabela de saques (se ainda não existir)
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.influencers(id) on delete cascade,
  method text not null,
  amount numeric(12,2) not null check (amount >= 0),
  pix_key text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  deadline_at timestamptz,
  paid_at timestamptz
);

create index if not exists idx_withdrawals_user on public.withdrawal_requests (user_id);

-- RLS dev (opcional; remova em produção)
alter table public.withdrawal_requests enable row level security;
-- Remove permissive dev policy if present
drop policy if exists dev_withdrawals_all on public.withdrawal_requests;

-- Sales policies
drop policy if exists sales_self_select on public.sales;
create policy sales_self_select
on public.sales
for select
to authenticated
using (influencer_id = auth.uid());

drop policy if exists sales_admin_select on public.sales;
create policy sales_admin_select
on public.sales
for select
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

-- Admin can insert/update/delete any sale (panel operations)
drop policy if exists sales_admin_insert on public.sales;
create policy sales_admin_insert
on public.sales
for insert
to authenticated
with check ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

drop policy if exists sales_admin_update on public.sales;
create policy sales_admin_update
on public.sales
for update
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com')
with check ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

drop policy if exists sales_admin_delete on public.sales;
create policy sales_admin_delete
on public.sales
for delete
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

-- Withdrawal requests policies
-- Influencer: can select own, insert for self
drop policy if exists withdrawals_self_select on public.withdrawal_requests;
create policy withdrawals_self_select
on public.withdrawal_requests
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists withdrawals_self_insert on public.withdrawal_requests;
create policy withdrawals_self_insert
on public.withdrawal_requests
for insert
to authenticated
with check (user_id = auth.uid());

-- Admin by email: can select all and update any (to mark paid)
drop policy if exists withdrawals_admin_select on public.withdrawal_requests;
create policy withdrawals_admin_select
on public.withdrawal_requests
for select
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

drop policy if exists withdrawals_admin_update on public.withdrawal_requests;
create policy withdrawals_admin_update
on public.withdrawal_requests
for update
to authenticated
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com')
with check ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lovablemoneyenzo@gmail.com');

-- Função: quando marcar como pago, diminuir do pending_payment
create or replace function public.withdrawals_after_update()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'paid' and coalesce(old.status, '') <> 'paid' then
    update public.influencers
      set pending_payment = greatest(pending_payment - new.amount, 0), updated_at = now()
      where id = new.user_id;
  elsif old.status = 'paid' and new.status <> 'paid' then
    -- Se reverter um pagamento, retorna o valor para pending
    update public.influencers
      set pending_payment = pending_payment + new.amount, updated_at = now()
      where id = new.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists withdrawal_requests_au on public.withdrawal_requests;
create trigger withdrawal_requests_au
after update on public.withdrawal_requests
for each row execute function public.withdrawals_after_update();

-- Caso se insira um saque já pago, também ajusta
create or replace function public.withdrawals_after_insert()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'paid' then
    update public.influencers
      set pending_payment = greatest(pending_payment - new.amount, 0), updated_at = now()
      where id = new.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists withdrawal_requests_ai on public.withdrawal_requests;
create trigger withdrawal_requests_ai
after insert on public.withdrawal_requests
for each row execute function public.withdrawals_after_insert();
