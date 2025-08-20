-- 0002_extended_features.sql (idempotent; badges, tags, exports, insights, liquidity, baselines, theme)

-- Theme on profile (guarded)
alter table profile add column if not exists theme text;
alter table profile alter column theme set default 'atelier_horloger';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.profile'::regclass and conname='profile_theme_check'
  ) then
    alter table profile add constraint profile_theme_check
      check (theme in ('atelier_horloger', 'coffre_fort', 'catalogue_vintage'));
  end if;
end$$;

-- ===== BADGE & USER_BADGE =====
do $$
begin
  if to_regclass('public.badge') is null then
    create table badge (
      id uuid primary key default gen_random_uuid(),
      code text unique,
      name text not null,
      rule text not null,
      icon_url text,
      description text,
      category text check (category in ('collection','social','premium','achievement')),
      created_at timestamptz default now()
    );
  else
    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='badge' and column_name='code'
    ) then
      alter table badge add column code text;
      do $inner$
      begin
        if not exists (
          select 1 from pg_constraint
          where conrelid='public.badge'::regclass and conname='badge_code_key'
        ) then
          alter table badge add constraint badge_code_key unique (code);
        end if;
      end
      $inner$;
    end if;
    if not exists (
      select 1 from pg_constraint
      where conrelid='public.badge'::regclass and conname='badge_category_check'
    ) then
      alter table badge add constraint badge_category_check
        check (category in ('collection','social','premium','achievement'));
    end if;
  end if;
end$$;

do $$
begin
  if to_regclass('public.user_badge') is null then
    create table user_badge (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      badge_id uuid not null references badge(id) on delete cascade,
      unlocked_at timestamptz default now(),
      unique(user_id, badge_id)
    );
  else
    if not exists (
      select 1 from pg_constraint
      where conrelid='public.user_badge'::regclass and conname='user_badge_user_id_badge_id_key'
    ) then
      alter table user_badge add constraint user_badge_user_id_badge_id_key unique (user_id, badge_id);
    end if;
  end if;
end$$;

-- ===== MODEL_TAG =====
do $$
begin
  if to_regclass('public.model_tag') is null then
    create table model_tag (
      id uuid primary key default gen_random_uuid(),
      model_id uuid not null references model(id) on delete cascade,
      tag text not null,
      unique(model_id, tag)
    );
  else
    if not exists (
      select 1 from pg_constraint
      where conrelid='public.model_tag'::regclass and conname='model_tag_model_id_tag_key'
    ) then
      alter table model_tag add constraint model_tag_model_id_tag_key unique (model_id, tag);
    end if;
  end if;
end$$;

-- ===== EXPORT_LOGS =====
do $$
begin
  if to_regclass('public.export_logs') is null then
    create table export_logs (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      export_type text not null check (export_type in ('pdf','csv')),
      file_url text,
      checksum_sha256 text,
      created_at timestamptz default now()
    );
  end if;
end$$;

-- ===== INSIGHTS_NOTIFICATION =====
do $$
begin
  if to_regclass('public.insights_notification') is null then
    create table insights_notification (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      kind text not null,
      payload jsonb,
      sent_at timestamptz
    );
  end if;
end$$;

-- ===== LIQUIDITY_RARITY_SNAPSHOT =====
do $$
begin
  if to_regclass('public.liquidity_rarity_snapshot') is null then
    create table liquidity_rarity_snapshot (
      id uuid primary key default gen_random_uuid(),
      model_id uuid not null references model(id) on delete cascade,
      captured_at timestamptz not null default now(),
      liquidity_bucket text check (liquidity_bucket in ('fast','medium','slow')),
      rarity_score numeric,
      unique(model_id, captured_at)
    );
  end if;
end$$;

-- ===== INDEX_BASELINE =====
do $$
begin
  if to_regclass('public.index_baseline') is null then
    create table index_baseline (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      d date not null,
      value numeric not null,
      unique(name, d)
    );
  end if;
end$$;

-- Indexes (idempotent)
create index if not exists idx_model_tag_model on model_tag(model_id);
create index if not exists idx_export_logs_user_time on export_logs(user_id, created_at desc);
create index if not exists idx_insights_user_time on insights_notification(user_id, sent_at desc);
create index if not exists idx_lrs_model_time on liquidity_rarity_snapshot(model_id, captured_at desc);
create index if not exists idx_index_baseline_name_date on index_baseline(name, d);

-- RLS enable (safe)
alter table if exists user_badge enable row level security;
alter table if exists model_tag enable row level security;
alter table if exists export_logs enable row level security;
alter table if exists insights_notification enable row level security;
alter table if exists liquidity_rarity_snapshot enable row level security;
alter table if exists index_baseline enable row level security;

-- Simple policies (guarded)
do $$
begin
  if to_regclass('public.user_badge') is not null then
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_badge' and policyname='user_badge_self') then
      create policy "user_badge_self" on user_badge for all using (user_id = auth.uid()) with check (user_id = auth.uid());
    end if;
  end if;

  if to_regclass('public.export_logs') is not null then
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='export_logs' and policyname='export_logs_self') then
      create policy "export_logs_self" on export_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
    end if;
  end if;

  if to_regclass('public.insights_notification') is not null then
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='insights_notification' and policyname='insights_notification_self') then
      create policy "insights_notification_self" on insights_notification for all using (user_id = auth.uid()) with check (user_id = auth.uid());
    end if;
  end if;

  if to_regclass('public.liquidity_rarity_snapshot') is not null then
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='liquidity_rarity_snapshot' and policyname='lrs_read') then
      create policy "lrs_read" on liquidity_rarity_snapshot for select using (true);
    end if;
  end if;

  if to_regclass('public.index_baseline') is not null then
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='index_baseline' and policyname='index_baseline_read') then
      create policy "index_baseline_read" on index_baseline for select using (true);
    end if;
  end if;
end$$;
