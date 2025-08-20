-- 0003_high_priority.sql (idempotent; comparator, auctions, highlight, views)

-- ===== Market Prices (comparator) =====
create table if not exists market_prices (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model_ref text not null,
  source text not null check (source in ('ebay','chrono24','watchcharts')),
  currency text not null,
  price numeric not null,
  url text,
  fetched_at timestamptz not null default now()
);

alter table market_prices enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='market_prices' and policyname='market_prices_read') then
    create policy "market_prices_read" on market_prices for select using (true);
  end if;
end$$;

create index if not exists idx_mkt_brand_ref_time on market_prices(brand, model_ref, fetched_at desc);

-- ===== Auction Events =====
create table if not exists auction_events (
  id uuid primary key default gen_random_uuid(),
  house text not null,
  brand text,
  model text,
  model_ref text,
  event_date date not null,
  lot_url text,
  created_at timestamptz default now()
);

alter table auction_events enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='auction_events' and policyname='auction_events_read') then
    create policy "auction_events_read" on auction_events for select using (true);
  end if;
end$$;

create index if not exists idx_auc_date on auction_events(event_date);
create index if not exists idx_auc_brand_ref on auction_events(brand, model_ref);

-- ===== Profile.collection_score =====
alter table if exists profile add column if not exists collection_score int;

-- ===== Daily Highlight (for widget) =====
create table if not exists daily_highlight (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile(id) on delete cascade,
  watch_id uuid references watch_instance(id) on delete set null,
  date date not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table daily_highlight enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='daily_highlight' and policyname='daily_highlight_self') then
    create policy "daily_highlight_self" on daily_highlight
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end$$;

create index if not exists idx_highlight_user_date on daily_highlight(user_id, date desc);

-- ===== View: total collection estimated value =====
create or replace view v_user_total_value as
  select wi.user_id, coalesce(sum(ps.median),0)::numeric as estimated_total_value
  from watch_instance wi
  left join (
    select distinct on (model_id) model_id, median, captured_at
    from price_snapshot
    order by model_id, captured_at desc
  ) ps on ps.model_id = wi.model_id
  group by wi.user_id;
