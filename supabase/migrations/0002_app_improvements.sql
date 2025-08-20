-- 0002_app_improvements.sql
-- Extends core schema for Watch Collector improvements (no B2B)
-- Idempotency: use IF NOT EXISTS and guarded changes where possible.

-- ===== Extensions =====
create extension if not exists pgcrypto;

-- ===== Enums =====
do $$ begin
  create type membership_t as enum ('free','standard','collector');
exception when duplicate_object then null; end $$;

do $$ begin
  create type export_type_t as enum ('pdf','csv');
exception when duplicate_object then null; end $$;

do $$ begin
  create type insight_t as enum ('price_momentum','maintenance_due','rarity_change','liquidity_change');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tag_t as enum ('diver','chronograph','dress','sport','vintage');
exception when duplicate_object then null; end $$;

-- ===== Profile: themes, paywall tiers, notifications, privacy =====
alter table if exists profile
  add column if not exists theme text default 'atelier' check (theme in ('atelier','coffre','catalogue')),
  add column if not exists tier membership_t default 'free',
  add column if not exists onesignal_player_id text,
  add column if not exists is_private_mode boolean default false;

-- Broaden read policy so users can see friends/public pseudos
do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profile' and policyname='profile self or public or friends'
  ) then
    create policy "profile self or public or friends" on profile
      for select using (
        auth.uid() = id
        or is_public = true
        or exists (
          select 1 from friendship f
          where f.status='accepted'
            and ((f.user_id = id and f.friend_id = auth.uid()) or (f.friend_id = id and f.user_id = auth.uid()))
        )
      );
  end if;
end
$pl$;

-- ===== Watch instance: serial hashing + optional ciphertext =====
alter table if exists watch_instance
  add column if not exists serial_hash text,
  add column if not exists serial_ciphertext text;

-- Compute serial_hash automatically when serial is present
create or replace function fn_set_serial_hash()
returns trigger language plpgsql as $$
begin
  if new.serial is not null then
    new.serial_hash := encode(digest(new.serial::text, 'sha256'), 'hex');
  end if;
  return new;
end$$;

drop trigger if exists trg_set_serial_hash on watch_instance;
create trigger trg_set_serial_hash
before insert or update of serial on watch_instance
for each row execute function fn_set_serial_hash();

-- Enforce Free tier cap: max 5 watches if profile.tier='free'
create or replace function fn_enforce_free_cap_watch()
returns trigger language plpgsql as $$
declare
  v_tier membership_t;
  v_count int;
begin
  select tier into v_tier from profile where id = new.user_id;
  if v_tier = 'free' then
    select count(*) into v_count from watch_instance w where w.user_id = new.user_id;
    if v_count >= 5 then
      raise exception 'FREE_TIER_LIMIT_REACHED';
    end if;
  end if;
  return new;
end$$;

drop trigger if exists trg_enforce_free_cap on watch_instance;
create trigger trg_enforce_free_cap
before insert on watch_instance
for each row execute function fn_enforce_free_cap_watch();

-- ===== Badges =====
create table if not exists badge (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- e.g., ROLEX_ADDICT, DIVER_KING, VINTAGE_LOVER
  name text not null,
  description text,
  icon_url text
);

create table if not exists user_badge (
  user_id uuid references profile(id) on delete cascade,
  badge_id uuid references badge(id) on delete cascade,
  unlocked_at timestamptz default now(),
  primary key (user_id, badge_id)
);

alter table user_badge enable row level security;

do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_badge' and policyname='user_badge self'
  ) then
    create policy "user_badge self" on user_badge
      for all using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$pl$;

-- Optional tagging per model (for analytics/portfolio health)
create table if not exists model_tag (
  model_id uuid references model(id) on delete cascade,
  tag tag_t not null,
  primary key (model_id, tag)
);

-- Public read for static metadata
alter table model_tag enable row level security;
do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='model_tag' and policyname='model_tag readable'
  ) then
    create policy "model_tag readable" on model_tag for select using (true);
  end if;
end
$pl$;

-- Badge evaluation helpers
create or replace function fn_is_vintage(p_model_id uuid)
returns boolean language sql stable as $$
  select coalesce(m.year_end, m.year_start) is not null
     and coalesce(m.year_end, m.year_start) <= 1999
  from model m where m.id = p_model_id;
$$;

create or replace function fn_evaluate_badges(p_user_id uuid)
returns void language plpgsql as $$
declare
  v_rolex_count int := 0;
  v_diver_count int := 0;
  v_vintage_count int := 0;
  b_rolex uuid;
  b_diver uuid;
  b_vintage uuid;
begin
  -- badge ids by code
  select id into b_rolex from badge where code='ROLEX_ADDICT';
  select id into b_diver from badge where code='DIVER_KING';
  select id into b_vintage from badge where code='VINTAGE_LOVER';

  -- counts
  select count(*) into v_rolex_count
  from watch_instance wi
  join model mo on mo.id = wi.model_id
  join brand br on br.id = mo.brand_id
  where wi.user_id = p_user_id and br.name ilike 'rolex%';

  select count(distinct wi.id) into v_diver_count
  from watch_instance wi
  join model_tag mt on mt.model_id = wi.model_id and mt.tag='diver'
  where wi.user_id = p_user_id;

  select count(*) into v_vintage_count
  from watch_instance wi
  where wi.user_id = p_user_id and fn_is_vintage(wi.model_id);

  -- unlock logic
  if b_rolex is not null and v_rolex_count >= 5 then
    insert into user_badge(user_id, badge_id)
      values (p_user_id, b_rolex)
      on conflict do nothing;
  end if;

  if b_diver is not null and v_diver_count >= 3 then
    insert into user_badge(user_id, badge_id)
      values (p_user_id, b_diver)
      on conflict do nothing;
  end if;

  if b_vintage is not null and v_vintage_count >= 10 then
    insert into user_badge(user_id, badge_id)
      values (p_user_id, b_vintage)
      on conflict do nothing;
  end if;
end$$;

-- Trigger to auto-evaluate badges on collection changes
create or replace function fn_after_watch_change()
returns trigger language plpgsql as $$
begin
  perform fn_evaluate_badges(new.user_id);
  return new;
end$$;

drop trigger if exists trg_after_watch_change on watch_instance;
create trigger trg_after_watch_change
after insert or update or delete on watch_instance
for each row execute function fn_after_watch_change();

-- ===== Assurance exports log (with hash) =====
create table if not exists export_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  export_type export_type_t not null,
  file_url text not null,
  checksum_sha256 text not null,
  created_at timestamptz default now()
);
alter table export_logs enable row level security;

do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='export_logs' and policyname='export self'
  ) then
    create policy "export self" on export_logs
      for all using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$pl$;

-- ===== Smart insights notification throttle =====
create table if not exists insights_notification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  model_id uuid references model(id) on delete cascade,
  kind insight_t not null,
  last_sent_at timestamptz,
  unique (user_id, model_id, kind)
);
alter table insights_notification enable row level security;

do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='insights_notification' and policyname='insights self'
  ) then
    create policy "insights self" on insights_notification
      for all using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$pl$;

-- ===== Liquidity & Rarity indices (per model) =====
create table if not exists liquidity_rarity_snapshot (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references model(id) on delete cascade,
  captured_at timestamptz not null default now(),
  active_offers int,
  sold_12m int,
  avg_days_to_sell numeric,
  rarity_score numeric,         -- 0..1 where 1 is rare
  liquidity_bucket text check (liquidity_bucket in ('fast','medium','slow')),
  unique (model_id, captured_at)
);

create index if not exists idx_lrs_model_time on liquidity_rarity_snapshot(model_id, captured_at desc);

-- Public read allowed (non-sensitive market meta)
alter table liquidity_rarity_snapshot enable row level security;
do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='liquidity_rarity_snapshot' and policyname='lrs readable'
  ) then
    create policy "lrs readable" on liquidity_rarity_snapshot for select using (true);
  end if;
end
$pl$;

-- ===== Baselines (Gold / SP500 or generic) =====
create table if not exists index_baseline (
  name text not null,   -- 'gold', 'sp500'
  d date not null,
  value numeric not null,
  primary key (name, d)
);

-- Public read for baseline data
alter table index_baseline enable row level security;
do $pl$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='index_baseline' and policyname='index_baseline readable'
  ) then
    create policy "index_baseline readable" on index_baseline for select using (true);
  end if;
end
$pl$;

-- ===== Portfolio health helpers =====
-- Map model->tags already provided by model_tag; this view aggregates counts per user
create or replace view v_portfolio_health as
  select
    wi.user_id,
    sum( case when mt.tag='vintage' then 1 else 0 end )::int as vintage_count,
    sum( case when mt.tag='sport' then 1 else 0 end )::int as sport_count,
    sum( case when mt.tag='dress' then 1 else 0 end )::int as dress_count
  from watch_instance wi
  left join model_tag mt on mt.model_id = wi.model_id
  group by wi.user_id;

-- Leaderboard among friends: returns friend_id + basic metrics for the current user context via RPC
create or replace function fn_friend_leaderboard()
returns table(friend_id uuid, total_watches int, vintage_count int, sport_count int, dress_count int)
language sql
stable
as $$
  with friends as (
    select case
      when f.user_id = auth.uid() then f.friend_id
      else f.user_id end as fid
    from friendship f
    where f.status='accepted' and (f.user_id = auth.uid() or f.friend_id = auth.uid())
  ),
  coll as (
    select wi.user_id, count(*) as total_watches
    from watch_instance wi
    where wi.user_id in (select fid from friends)
    group by wi.user_id
  ),
  health as (
    select user_id, vintage_count, sport_count, dress_count
    from v_portfolio_health
    where user_id in (select fid from friends)
  )
  select c.user_id as friend_id, c.total_watches, coalesce(h.vintage_count,0), coalesce(h.sport_count,0), coalesce(h.dress_count,0)
  from coll c
  left join health h on h.user_id = c.user_id
  order by c.total_watches desc;
$$;

-- ===== Maintenance due helper (next due date) =====
create or replace view v_next_service_due as
with last_service as (
  select
    wi.id as watch_instance_id,
    max(se.date) as last_date,
    mo.caliber_id
  from watch_instance wi
  left join service_event se on se.watch_instance_id = wi.id
  left join model mo on mo.id = wi.model_id
  group by wi.id, mo.caliber_id
), rules as (
  select sr.caliber_id, sr.interval_months
  from service_rule sr
)
select
  ls.watch_instance_id,
  case
    when r.interval_months is null then null
    when ls.last_date is not null then (ls.last_date + (r.interval_months || ' months')::interval)
    else null
  end as due_date,
  case
    when r.interval_months is null then false
    when ls.last_date is not null and (ls.last_date + (r.interval_months || ' months')::interval) < now() then true
    else false
  end as is_overdue
from last_service ls
left join rules r on r.caliber_id = ls.caliber_id;

-- ===== Indices for perf =====
create index if not exists idx_watch_user on watch_instance(user_id);
create index if not exists idx_model_ref on model(reference);
create index if not exists idx_price_snapshot_model_time on price_snapshot(model_id, captured_at desc);

-- Done.
