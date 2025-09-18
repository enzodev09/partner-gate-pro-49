# Supabase schema for influencers and sales

This folder contains SQL files to set up the backend (tables, triggers, and dev RLS policies) to manage real influencers and their sales.

## Files

- `01_influencers_sales_schema.sql`: Creates tables `public.influencers` and `public.sales`, adds aggregation triggers to keep totals up-to-date, enables RLS with permissive DEV policies, and a trigger to auto-create an influencer profile when a new Auth user is registered.
- `02_seed_dev.sql`: Example to insert a sale for a given influencer by email and preview totals.

## Step-by-step (run once)

1. Open Supabase → SQL Editor → New query
2. Paste contents of `01_influencers_sales_schema.sql` and Run
3. Go to Authentication → Users → Add user
   - Add an email/password for your influencer (e.g., influencer@example.com)
   - After creation, check Table Editor → `public.influencers` to see the profile auto-created
4. (Optional) Insert a test sale:
   - Open SQL Editor again
   - Paste `02_seed_dev.sql`
   - Replace the email in the CTE with the user you created
   - Run and confirm the totals updated in `public.influencers`

### Patch rápido: coluna de contagem de vendas (total_sales_count)

Se o painel Admin estiver com erro ao listar influencers, provavelmente falta a coluna `total_sales_count` (contagem de vendas). Execute este patch idempotente:

```sql
-- Adiciona coluna de contagem de vendas, caso não exista
alter table public.influencers
   add column if not exists total_sales_count integer not null default 0;

-- Backfill: recalcula a contagem a partir da tabela sales
update public.influencers i
set total_sales_count = coalesce(s.cnt, 0)
from (
   select influencer_id, count(*)::int as cnt
   from public.sales
   group by influencer_id
) s
where i.id = s.influencer_id;

-- Verificação: listar colunas atuais da tabela
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'influencers'
order by column_name;
```

Após aplicar, recarregue o painel Admin e clique em “Atualizar”.

### Diagnóstico rápido: verifique o que pode ter quebrado

Se algo parou de funcionar, rode as consultas abaixo no SQL Editor do Supabase. Elas NÃO alteram dados — servem só para diagnóstico. Se houver divergências, use o “Patch rápido” acima para corrigir a contagem.

```sql
-- 1) As tabelas existem?
select
  to_regclass('public.influencers') as influencers_table,
  to_regclass('public.sales')       as sales_table;

-- 2) Quantidade de linhas em cada tabela (ajuda a detectar truncamentos acidentais)
select
  (select count(*) from public.influencers) as influencers_rows,
  (select count(*) from public.sales)       as sales_rows;

-- 3) Triggers existentes (verifique se há triggers em 'sales' que atualizam 'influencers')
select
  c.relname as table_name,
  t.tgname  as trigger_name,
  pg_get_triggerdef(t.oid) as trigger_def
from pg_trigger t
join pg_class   c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('sales', 'influencers')
  and not t.tgisinternal
order by c.relname, t.tgname;

-- 4) Conferência: contagem real de vendas x coluna armazenada (total_sales_count)
--    Se 'in_sync' = false, rode o "Patch rápido" de contagem para corrigir.
select
  i.id,
  i.email,
  i.total_sales_count as stored_count,
  coalesce(s.cnt, 0)  as real_count,
  (i.total_sales_count = coalesce(s.cnt, 0)) as in_sync
from public.influencers i
left join (
  select influencer_id, count(*)::int as cnt
  from public.sales
  group by influencer_id
) s on s.influencer_id = i.id
order by i.email;

-- 5) RLS ativo e políticas (em DEV deve estar permissivo/open)
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in ('influencers','sales');

select schemaname, tablename, polname, cmd
from pg_policies
where schemaname = 'public' and tablename in ('influencers','sales')
order by tablename, polname;
```

Dicas:
- Se a coluna total_sales_count estiver divergente, aplique o “Patch rápido” acima e recarregue o painel.
- Se não houver triggers em public.sales para atualizar agregados, reexecute o script “01_influencers_sales_schema.sql” com cuidado (apenas uma vez) ou compare com o repositório.
- Se RLS estiver bloqueando em DEV, confirme que as políticas abertas de DEV foram criadas conforme o script 01.

## Notes

- DEV policies are OPEN (allow all). Do NOT use in production.
- After wiring Auth in the app, we will replace these with strict policies so that:
  - Admins can manage any influencer and sales
  - Each influencer can only read/update their own data
- Triggers update the `total_sales`, `total_commissions`, and `pending_payment` when you add/update/delete sales.
- You can later add more fields (e.g., `avatar_url`, more social links) safely.
