create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First signed-in person to call this becomes the workspace admin.
create or replace function public.claim_admin_if_none()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (auth.uid(), 'admin');
  end if;
  return public.has_role(auth.uid(), 'admin');
end $$;
revoke execute on function public.claim_admin_if_none() from anon, public;
grant execute on function public.claim_admin_if_none() to authenticated;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  customer_since int not null default extract(year from now())::int,
  sentiment text not null default 'Neutral',
  created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_number text not null,
  status text not null default 'Processing',
  expected text,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel text not null default 'Website',
  status text not null default 'AI resolved',
  intent text not null default 'General question',
  confidence int not null default 90,
  response_seconds int not null default 12,
  csat int,
  created_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('customer','ai','agent')),
  body text not null,
  created_at timestamptz not null default now()
);
create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['customers','orders','conversations','messages','knowledge_articles'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Admins manage %s" on public.%I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))', t, t);
  end loop;
end $$;

-- Anonymised public snapshot for the homepage. No emails, surnames reduced to an initial.
create or replace function public.public_workspace_snapshot()
returns jsonb language sql stable security definer set search_path = public as $$
  with mask as (
    select c.id,
      split_part(c.full_name, ' ', 1) || coalesce(' ' || nullif(left(split_part(c.full_name, ' ', 2), 1), '') || '.', '') as display_name,
      c.customer_since, c.sentiment
    from customers c
  )
  select jsonb_build_object(
    'threads', coalesce((
      select jsonb_agg(t order by t->>'created_at' desc) from (
        select jsonb_build_object(
          'id', cv.id, 'name', m.display_name, 'channel', cv.channel, 'status', cv.status,
          'intent', cv.intent, 'confidence', cv.confidence, 'created_at', cv.created_at,
          'messages', coalesce((select jsonb_agg(jsonb_build_object('from', case when ms.sender = 'customer' then 'customer' else 'ai' end,
              'text', regexp_replace(regexp_replace(ms.body, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email hidden]', 'g'), '\+?\d[\d\s().-]{7,}\d', '[phone hidden]', 'g'))
              order by ms.created_at) from messages ms where ms.conversation_id = cv.id), '[]'::jsonb),
          'meta', jsonb_build_array(
            jsonb_build_array('Customer since', m.customer_since::text),
            jsonb_build_array('Orders', (select count(*) from orders o where o.customer_id = cv.customer_id)::text),
            jsonb_build_array('Total spent', '$' || to_char(coalesce((select sum(total) from orders o where o.customer_id = cv.customer_id), 0), 'FM999,999,990')),
            jsonb_build_array('Sentiment', m.sentiment))
        ) as t
        from conversations cv join mask m on m.id = cv.customer_id
        order by cv.created_at desc limit 6
      ) x), '[]'::jsonb),
    'analytics', jsonb_build_object(
      '7 days', (select jsonb_build_object('count', count(*), 'resolution', coalesce(round(100.0 * count(*) filter (where status = 'AI resolved') / nullif(count(*),0)),0), 'response', coalesce(round(avg(response_seconds)),0), 'csat', coalesce(round(avg(csat)),0)) from conversations where created_at > now() - interval '7 days'),
      '30 days', (select jsonb_build_object('count', count(*), 'resolution', coalesce(round(100.0 * count(*) filter (where status = 'AI resolved') / nullif(count(*),0)),0), 'response', coalesce(round(avg(response_seconds)),0), 'csat', coalesce(round(avg(csat)),0)) from conversations where created_at > now() - interval '30 days'),
      '90 days', (select jsonb_build_object('count', count(*), 'resolution', coalesce(round(100.0 * count(*) filter (where status = 'AI resolved') / nullif(count(*),0)),0), 'response', coalesce(round(avg(response_seconds)),0), 'csat', coalesce(round(avg(csat)),0)) from conversations where created_at > now() - interval '90 days'),
      'daily', coalesce((select jsonb_agg(jsonb_build_object('day', to_char(d, 'Dy'), 'value',
          coalesce((select round(100.0 * count(*) filter (where status = 'AI resolved') / nullif(count(*),0)) from conversations where created_at::date = d::date), 0)) order by d)
        from generate_series(current_date - 6, current_date, interval '1 day') d), '[]'::jsonb)
    ),
    'orders', coalesce((select jsonb_agg(jsonb_build_object('number', order_number, 'status', status, 'expected', expected)) from (select * from orders order by created_at desc limit 50) o), '[]'::jsonb),
    'knowledge', coalesce((select jsonb_agg(jsonb_build_object('title', title, 'body', left(body, 1500))) from (select * from knowledge_articles order by created_at desc limit 30) k), '[]'::jsonb)
  )
$$;
revoke execute on function public.public_workspace_snapshot() from public;
grant execute on function public.public_workspace_snapshot() to anon, authenticated, service_role;