-- 0001_watchcollector.sql (corrected)
-- Core schema for Watch Collector + valid RLS policies

-- ===== Extensions =====
create extension if not exists pgcrypto;

-- ===== Core dictionaries =====
create table if not exists brand (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text generated always as (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) stored unique
);

create table if not exists caliber (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_interval_months int,
  service_cost_low int,
  service_cost_high int
);

create table if not exists model (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brand(id) on delete cascade not null,
  name text not null,
  reference text,
  caliber_id uuid references caliber(id),
  year_start int,
  year_end int,
  unique(brand_id, name, reference)
);

-- ===== Users & social =====
create table if not exists profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  pseudo text unique not null,
  lang text default 'fr',
  is_public boolean default false,
  created_at timestamptz default now()
);

create table if not exists friendship (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  friend_id uuid references profile(id) on delete cascade,
  status text check (status in ('pending','accepted')) default 'pending',
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- ===== User collection =====
do $$ begin
  create type condition_t as enum ('new','excellent','very_good','good','fair','poor');
exception when duplicate_object then null; end $$;

create table if not exists watch_instance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  model_id uuid references model(id) on delete set null,
  serial text,
  purchase_price int,
  purchase_currency text default 'EUR',
  purchase_date date,
  box_papers boolean,
  condition condition_t default 'very_good',
  notes text,
  visibility text check (visibility in ('private','friends','public')) default 'private',
  created_at timestamptz default now()
);

create table if not exists photo (
  id uuid primary key default gen_random_uuid(),
  watch_instance_id uuid references watch_instance(id) on delete cascade,
  url text not null,
  is_cover boolean default false,
  credits text,
  license text,
  created_at timestamptz default now()
);

-- ===== Service / maintenance =====
create table if not exists service_rule (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brand(id) on delete cascade,
  caliber_id uuid references caliber(id) on delete cascade,
  interval_months int,
  cost_low int,
  cost_high int,
  unique(brand_id, caliber_id)
);

create table if not exists service_event (
  id uuid primary key default gen_random_uuid(),
  watch_instance_id uuid references watch_instance(id) on delete cascade,
  date date,
  type text,
  cost int,
  workshop_name text,
  notes text,
  created_at timestamptz default now()
);

-- ===== Pricing snapshots & alerts =====
create table if not exists price_snapshot (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references model(id) on delete cascade,
  captured_at timestamptz not null default now(),
  median numeric,
  p25 numeric,
  p75 numeric,
  sample_size int,
  source_breakdown jsonb
);

create table if not exists price_alert (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  model_id uuid references model(id) on delete cascade,
  direction text check (direction in ('above','below','delta')),
  threshold_numeric numeric,
  active boolean default true,
  created_at timestamptz default now()
);

-- ===== Share tokens (for public share links validated by edge function) =====
create table if not exists share_token (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz
);

-- ===== Enable RLS =====
alter table profile enable row level security;
alter table friendship enable row level security;
alter table watch_instance enable row level security;
alter table photo enable row level security;
alter table service_event enable row level security;
alter table price_alert enable row level security;
alter table share_token enable row level security;

-- ===== RLS policies (valid form: SELECT/INSERT/UPDATE/DELETE separated) =====

-- PROFILE
create policy if not exists "profile_select_self"
  on profile for select
  using (auth.uid() = id);

create policy if not exists "profile_insert_self"
  on profile for insert
  with check (auth.uid() = id);

create policy if not exists "profile_update_self"
  on profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "profile_delete_self"
  on profile for delete
  using (auth.uid() = id);

-- WATCH_INSTANCE
create policy if not exists "watch_select_visibility"
  on watch_instance for select
  using (
    user_id = auth.uid()
    or visibility = 'public'
    or (
      visibility = 'friends' and exists (
        select 1 from friendship f
        where f.status='accepted'
          and (
            (f.user_id = user_id and f.friend_id = auth.uid())
            or (f.friend_id = user_id and f.user_id = auth.uid())
          )
      )
    )
  );

create policy if not exists "watch_insert_self"
  on watch_instance for insert
  with check (user_id = auth.uid());

create policy if not exists "watch_update_self"
  on watch_instance for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "watch_delete_self"
  on watch_instance for delete
  using (user_id = auth.uid());

-- PHOTO
create policy if not exists "photo_select_visibility"
  on photo for select
  using (
    exists (
      select 1 from watch_instance w
      where w.id = photo.watch_instance_id
        and (w.user_id = auth.uid() or w.visibility in ('public','friends'))
    )
  );

create policy if not exists "photo_insert_self"
  on photo for insert
  with check (
    exists (
      select 1 from watch_instance w
      where w.id = watch_instance_id
        and w.user_id = auth.uid()
    )
  );

create policy if not exists "photo_update_self"
  on photo for update
  using (
    exists (
      select 1 from watch_instance w
      where w.id = photo.watch_instance_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from watch_instance w
      where w.id = watch_instance_id
        and w.user_id = auth.uid()
    )
  );

create policy if not exists "photo_delete_self"
  on photo for delete
  using (
    exists (
      select 1 from watch_instance w
      where w.id = photo.watch_instance_id
        and w.user_id = auth.uid()
    )
  );

-- SERVICE_EVENT
create policy if not exists "service_select_self"
  on service_event for select
  using (
    exists (
      select 1 from watch_instance w
      where w.id = service_event.watch_instance_id
        and w.user_id = auth.uid()
    )
  );

create policy if not exists "service_insert_self"
  on service_event for insert
  with check (
    exists (
      select 1 from watch_instance w
      where w.id = watch_instance_id
        and w.user_id = auth.uid()
    )
  );

create policy if not exists "service_update_self"
  on service_event for update
  using (
    exists (
      select 1 from watch_instance w
      where w.id = service_event.watch_instance_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from watch_instance w
      where w.id = watch_instance_id
        and w.user_id = auth.uid()
    )
  );

create policy if not exists "service_delete_self"
  on service_event for delete
  using (
    exists (
      select 1 from watch_instance w
      where w.id = service_event.watch_instance_id
        and w.user_id = auth.uid()
    )
  );

-- PRICE_ALERT
create policy if not exists "alert_all_self"
  on price_alert for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- SHARE_TOKEN (public read; validation par edge function)
create policy if not exists "share_token_public_read"
  on share_token for select
  using (true);

-- ===== Helpful indexes =====
create index if not exists idx_watch_user on watch_instance(user_id);
create index if not exists idx_model_ref on model(reference);
create index if not exists idx_price_snapshot_model_time on price_snapshot(model_id, captured_at desc);
