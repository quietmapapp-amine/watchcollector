-- reconcile_remote.sql
-- One-shot, idempotent reconciliation for the remote database.
-- Safe to run multiple times. Only creates/adjusts missing pieces.

---------------------------
-- Helpers
---------------------------
-- nothing needed; we use to_regclass / information_schema / pg_catalog checks.

---------------------------
-- PROFILE adjustments
---------------------------
-- Add theme (text) + default + check
ALTER TABLE IF EXISTS profile ADD COLUMN IF NOT EXISTS theme text;
ALTER TABLE IF EXISTS profile ALTER COLUMN theme SET DEFAULT 'atelier_horloger';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profile'::regclass AND conname = 'profile_theme_check'
  ) THEN
    ALTER TABLE profile
      ADD CONSTRAINT profile_theme_check
      CHECK (theme IN ('atelier_horloger','coffre_fort','catalogue_vintage'));
  END IF;
END$$;

-- Add collection_score
ALTER TABLE IF EXISTS profile ADD COLUMN IF NOT EXISTS collection_score int;

---------------------------
-- BADGE + USER_BADGE
---------------------------
DO $$
BEGIN
  -- Table badge (minimal schema if absent)
  IF to_regclass('public.badge') IS NULL THEN
    CREATE TABLE badge (
      id uuid primary key default gen_random_uuid(),
      code text unique,
      name text not null,
      rule text not null,
      icon_url text,
      description text,
      category text,
      created_at timestamptz default now()
    );
  END IF;

  -- Ensure required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='badge' AND column_name='code'
  ) THEN
    ALTER TABLE badge ADD COLUMN code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='badge' AND column_name='category'
  ) THEN
    ALTER TABLE badge ADD COLUMN category text;
  END IF;

  -- Constraints
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.badge'::regclass AND conname='badge_code_key'
  ) THEN
    ALTER TABLE badge ADD CONSTRAINT badge_code_key UNIQUE (code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.badge'::regclass AND conname='badge_category_check'
  ) THEN
    ALTER TABLE badge ADD CONSTRAINT badge_category_check
      CHECK (category IN ('collection','social','premium','achievement'));
  END IF;
END$$;

DO $$
BEGIN
  IF to_regclass('public.user_badge') IS NULL THEN
    CREATE TABLE user_badge (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      badge_id uuid not null references badge(id) on delete cascade,
      unlocked_at timestamptz default now(),
      unique(user_id, badge_id)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.user_badge'::regclass AND conname='user_badge_user_id_badge_id_key'
  ) THEN
    ALTER TABLE user_badge ADD CONSTRAINT user_badge_user_id_badge_id_key UNIQUE (user_id, badge_id);
  END IF;
END$$;

---------------------------
-- MODEL_TAG
---------------------------
DO $$
BEGIN
  IF to_regclass('public.model_tag') IS NULL THEN
    CREATE TABLE model_tag (
      id uuid primary key default gen_random_uuid(),
      model_id uuid not null references model(id) on delete cascade,
      tag text not null,
      unique(model_id, tag)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.model_tag'::regclass AND conname='model_tag_model_id_tag_key'
  ) THEN
    ALTER TABLE model_tag ADD CONSTRAINT model_tag_model_id_tag_key UNIQUE (model_id, tag);
  END IF;
END$$;

---------------------------
-- EXPORT_LOGS
---------------------------
DO $$
BEGIN
  IF to_regclass('public.export_logs') IS NULL THEN
    CREATE TABLE export_logs (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      export_type text not null check (export_type in ('pdf','csv')),
      file_url text,
      checksum_sha256 text,
      created_at timestamptz default now()
    );
  END IF;
END$$;

---------------------------
-- INSIGHTS_NOTIFICATION (fix for missing sent_at)
---------------------------
DO $$
BEGIN
  IF to_regclass('public.insights_notification') IS NULL THEN
    CREATE TABLE insights_notification (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      kind text not null,
      payload jsonb,
      sent_at timestamptz
    );
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='insights_notification' AND column_name='user_id'
    ) THEN
      ALTER TABLE insights_notification ADD COLUMN user_id uuid;
      BEGIN
        ALTER TABLE insights_notification
          ADD CONSTRAINT insights_notification_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
      END;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='insights_notification' AND column_name='kind'
    ) THEN
      ALTER TABLE insights_notification ADD COLUMN kind text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='insights_notification' AND column_name='payload'
    ) THEN
      ALTER TABLE insights_notification ADD COLUMN payload jsonb;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='insights_notification' AND column_name='sent_at'
    ) THEN
      ALTER TABLE insights_notification ADD COLUMN sent_at timestamptz;
    END IF;
  END IF;
END$$;

---------------------------
-- LIQUIDITY_RARITY_SNAPSHOT
---------------------------
DO $$
BEGIN
  IF to_regclass('public.liquidity_rarity_snapshot') IS NULL THEN
    CREATE TABLE liquidity_rarity_snapshot (
      id uuid primary key default gen_random_uuid(),
      model_id uuid not null references model(id) on delete cascade,
      captured_at timestamptz not null default now(),
      liquidity_bucket text check (liquidity_bucket in ('fast','medium','slow')),
      rarity_score numeric,
      unique(model_id, captured_at)
    );
  END IF;
END$$;

---------------------------
-- INDEX_BASELINE
---------------------------
DO $$
BEGIN
  IF to_regclass('public.index_baseline') IS NULL THEN
    CREATE TABLE index_baseline (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      d date not null,
      value numeric not null,
      unique(name, d)
    );
  END IF;
END$$;

---------------------------
-- MARKET_PRICES (comparator)
---------------------------
DO $$
BEGIN
  IF to_regclass('public.market_prices') IS NULL THEN
    CREATE TABLE market_prices (
      id uuid primary key default gen_random_uuid(),
      brand text not null,
      model_ref text not null,
      source text not null check (source in ('ebay','chrono24','watchcharts')),
      currency text not null,
      price numeric not null,
      url text,
      fetched_at timestamptz not null default now()
    );
  END IF;
END$$;

---------------------------
-- AUCTION_EVENTS
---------------------------
DO $$
BEGIN
  IF to_regclass('public.auction_events') IS NULL THEN
    CREATE TABLE auction_events (
      id uuid primary key default gen_random_uuid(),
      house text not null,
      brand text,
      model text,
      model_ref text,
      event_date date not null,
      lot_url text,
      created_at timestamptz default now()
    );
  END IF;
END$$;

---------------------------
-- DAILY_HIGHLIGHT
---------------------------
DO $$
BEGIN
  IF to_regclass('public.daily_highlight') IS NULL THEN
    CREATE TABLE daily_highlight (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      watch_id uuid references watch_instance(id) on delete set null,
      date date not null,
      created_at timestamptz default now(),
      unique(user_id, date)
    );
  END IF;
END$$;

---------------------------
-- Indexes (guard existence of columns)
---------------------------
DO $$
BEGIN
  IF to_regclass('public.model_tag') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_model_tag_model ON model_tag(model_id);
  END IF;

  IF to_regclass('public.export_logs') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_export_logs_user_time ON export_logs(user_id, created_at DESC);
  END IF;

  IF to_regclass('public.insights_notification') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='insights_notification' AND column_name='sent_at')
  THEN
    CREATE INDEX IF NOT EXISTS idx_insights_user_time ON insights_notification(user_id, sent_at DESC);
  END IF;

  IF to_regclass('public.liquidity_rarity_snapshot') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_lrs_model_time ON liquidity_rarity_snapshot(model_id, captured_at DESC);
  END IF;

  IF to_regclass('public.index_baseline') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_index_baseline_name_date ON index_baseline(name, d);
  END IF;

  IF to_regclass('public.market_prices') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_mkt_brand_ref_time ON market_prices(brand, model_ref, fetched_at DESC);
  END IF;

  IF to_regclass('public.auction_events') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_auc_date ON auction_events(event_date);
    CREATE INDEX IF NOT EXISTS idx_auc_brand_ref ON auction_events(brand, model_ref);
  END IF;

  IF to_regclass('public.daily_highlight') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_highlight_user_date ON daily_highlight(user_id, date DESC);
  END IF;
END$$;

---------------------------
-- RLS enable + policies (guarded)
---------------------------
ALTER TABLE IF EXISTS user_badge ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS model_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insights_notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS liquidity_rarity_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS index_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_highlight ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- self-scoped tables
  IF to_regclass('public.user_badge') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_badge' AND policyname='user_badge_self'
  ) THEN
    CREATE POLICY "user_badge_self" ON user_badge FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;

  IF to_regclass('public.export_logs') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='export_logs' AND policyname='export_logs_self'
  ) THEN
    CREATE POLICY "export_logs_self" ON export_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;

  IF to_regclass('public.insights_notification') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='insights_notification' AND policyname='insights_notification_self'
  ) THEN
    CREATE POLICY "insights_notification_self" ON insights_notification FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;

  -- public-read datasets
  IF to_regclass('public.liquidity_rarity_snapshot') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='liquidity_rarity_snapshot' AND policyname='lrs_read'
  ) THEN
    CREATE POLICY "lrs_read" ON liquidity_rarity_snapshot FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.index_baseline') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='index_baseline' AND policyname='index_baseline_read'
  ) THEN
    CREATE POLICY "index_baseline_read" ON index_baseline FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.market_prices') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='market_prices' AND policyname='market_prices_read'
  ) THEN
    CREATE POLICY "market_prices_read" ON market_prices FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.auction_events') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auction_events' AND policyname='auction_events_read'
  ) THEN
    CREATE POLICY "auction_events_read" ON auction_events FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.daily_highlight') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_highlight' AND policyname='daily_highlight_self'
  ) THEN
    CREATE POLICY "daily_highlight_self" ON daily_highlight FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

---------------------------
-- View for widget / dashboard
---------------------------
CREATE OR REPLACE VIEW v_user_total_value AS
  SELECT wi.user_id,
         COALESCE(SUM(ps.median),0)::numeric AS estimated_total_value
  FROM watch_instance wi
  LEFT JOIN (
    SELECT DISTINCT ON (model_id) model_id, median, captured_at
    FROM price_snapshot
    ORDER BY model_id, captured_at DESC
  ) ps ON ps.model_id = wi.model_id
  GROUP BY wi.user_id;
