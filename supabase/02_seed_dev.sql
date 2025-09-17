-- Insert a test influencer sale for a given influencer email
-- Replace the email below with the user you created in Auth
with inf as (
  select id from public.influencers where email = 'influencer@example.com'
)
insert into public.sales (influencer_id, product, customer, value, commission, date)
select id, 'Produto X', 'Cliente Y', 500.00, 75.00, now()
from inf;

-- Check aggregated metrics
select id, email, username, total_sales, total_commissions, pending_payment
from public.influencers
order by created_at desc
limit 5;
