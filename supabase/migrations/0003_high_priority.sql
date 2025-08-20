-- 0003_high_priority.sql
-- New tables/columns for price comparator, auctions calendar, investment baselines, collection scoring, daily widget highlight.

-- ===== Tables: Market Prices (comparator) =====
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

-- Public meta only; no user data here -> allow read
alter table market_prices enable row level security;
do $pl$ begin
  if not exists (select 1 from pg_policies where tablename='market_prices' and policyname='market_prices readable') then
    create policy "market_prices readable" on market_prices for select using (true);
  end if;
end $pl$;

create index if not exists idx_mkt_brand_ref_time on market_prices(brand, model_ref, fetched_at desc);

-- ===== Tables: Auction Events =====
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
do $pl$ begin
  if not exists (select 1 from pg_policies where tablename='auction_events' and policyname='auction_events readable') then
    create policy "auction_events readable" on auction_events for select using (true);
  end if;
end $pl$;

create index if not exists idx_auc_date on auction_events(event_date);
create index if not exists idx_auc_brand_ref on auction_events(brand, model_ref);

-- ===== Column: Profile.collection_score =====
alter table if exists profile
  add column if not exists collection_score int;

-- ===== Tables: Daily Highlight (for widget) =====
create table if not exists daily_highlight (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile(id) on delete cascade,
  watch_id uuid references watch_instance(id) on delete set null,
  date date not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table daily_highlight enable row level security;
do $pl$ begin
  if not exists (select 1 from pg_policies where tablename='daily_highlight' and policyname='daily_highlight self') then
    create policy "daily_highlight self" on daily_highlight
      for all using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $pl$;

create index if not exists idx_highlight_user_date on daily_highlight(user_id, date desc);

-- ===== Helper view: Total collection value per user (for widget) =====
create or replace view v_user_total_value as
  select wi.user_id, sum(coalesce(ps.median, 0))::numeric as estimated_total_value
  from watch_instance wi
  left join model m on m.id = wi.model_id
  left join (
    select distinct on (model_id) model_id, median, captured_at
    from price_snapshot
    order by model_id, captured_at desc
  ) ps on ps.model_id = wi.model_id
  group by wi.user_id;

-- Allow authenticated users to read their own value via RPC; view itself remains public readable only if needed later.
-- (No RLS on views; protect via RPC if desired.)

-- ===== Optional: RPC to fetch friend leaderboard (already exists in 0002) =====

-- Done.
