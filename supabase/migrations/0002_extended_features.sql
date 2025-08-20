-- Extended features migration for Watch Collector

-- Theme column: add if missing, then set default and check constraint safely
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS theme text;

-- Ensure default (idempotent)
ALTER TABLE profile
  ALTER COLUMN theme SET DEFAULT 'atelier_horloger';

-- Ensure allowed values constraint exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conrelid = 'public.profile'::regclass
    AND    conname  = 'profile_theme_check'
  ) THEN
    ALTER TABLE profile
      ADD CONSTRAINT profile_theme_check
      CHECK (theme IN ('atelier_horloger', 'coffre_fort', 'catalogue_vintage'));
  END IF;
END$$;

-- Badge system
CREATE TABLE badge (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule text not null,
  icon_url text,
  description text,
  category text check (category in ('collection', 'social', 'premium', 'achievement')),
  created_at timestamptz default now()
);

CREATE TABLE user_badge (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  badge_id uuid references badge(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- Export logs with hash signatures
CREATE TABLE export_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  export_type text check (export_type in ('csv', 'pdf')),
  file_hash text not null,
  file_size bigint,
  exported_at timestamptz default now(),
  metadata jsonb
);

-- Insights notifications for engagement
CREATE TABLE insights_notification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  type text check (type in ('price_change', 'maintenance_due', 'collection_insight', 'badge_unlocked')),
  title text not null,
  message text not null,
  data jsonb,
  sent_at timestamptz default now(),
  read_at timestamptz,
  unique(user_id, type, date_trunc('day', sent_at))
);

-- Extend watch_instance with encrypted serial hash
ALTER TABLE watch_instance ADD COLUMN serial_hash text;
ALTER TABLE watch_instance ADD COLUMN encrypted_serial text;

-- Liquidity and rarity tracking
CREATE TABLE market_metrics (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references model(id) on delete cascade,
  captured_at timestamptz default now(),
  liquidity_index numeric, -- avg_days_to_sell
  rarity_index numeric, -- 1 - (active_offers / volume_sold_last12m)
  active_listings_count int,
  volume_sold_12m numeric,
  market_trend text check (market_trend in ('rising', 'stable', 'declining'))
);

-- Gold and SP500 baseline for backtesting
CREATE TABLE market_baseline (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  gold_price_eur numeric,
  sp500_price_eur numeric,
  created_at timestamptz default now(),
  unique(date)
);

-- Portfolio health tracking
CREATE TABLE portfolio_health (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profile(id) on delete cascade,
  captured_at timestamptz default now(),
  sport_percentage numeric,
  dress_percentage numeric,
  vintage_percentage numeric,
  concentration_risk text check (concentration_risk in ('low', 'medium', 'high')),
  diversification_score numeric -- 0-100
);

-- RLS policies for new tables
ALTER TABLE badge enable row level security;
ALTER TABLE user_badge enable row level security;
ALTER TABLE export_logs enable row level security;
ALTER TABLE insights_notification enable row level security;
ALTER TABLE market_metrics enable row level security;
ALTER TABLE market_baseline enable row level security;
ALTER TABLE portfolio_health enable row level security;

-- Badge policies
CREATE POLICY "badge public read" on badge FOR SELECT USING (true);
CREATE POLICY "user badge self" on user_badge FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Export logs policies
CREATE POLICY "export logs self" on export_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Insights notifications policies
CREATE POLICY "insights self" on insights_notification FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Market metrics policies (read-only for authenticated users)
CREATE POLICY "market metrics read" on market_metrics FOR SELECT USING (auth.role() = 'authenticated');

-- Market baseline policies (read-only for authenticated users)
CREATE POLICY "market baseline read" on market_baseline FOR SELECT USING (auth.role() = 'authenticated');

-- Portfolio health policies
CREATE POLICY "portfolio health self" on portfolio_health FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_user_badge_user_id ON user_badge(user_id);
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_insights_notification_user_id ON insights_notification(user_id);
CREATE INDEX idx_market_metrics_model_id ON market_metrics(model_id);
CREATE INDEX idx_market_metrics_captured_at ON market_metrics(captured_at);
CREATE INDEX idx_portfolio_health_user_id ON portfolio_health(user_id);
CREATE INDEX idx_portfolio_health_captured_at ON portfolio_health(captured_at);
