-- 0002d_fix_insights_notification.sql
-- Make sure insights_notification has required columns, then create the index safely.

DO $$
BEGIN
  -- If table doesn't exist at all, create it with the correct schema
  IF to_regclass('public.insights_notification') IS NULL THEN
    CREATE TABLE insights_notification (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references profile(id) on delete cascade,
      kind text not null,
      payload jsonb,
      sent_at timestamptz
    );
  ELSE
    -- Add missing columns if needed
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='insights_notification' AND column_name='user_id'
    ) THEN
      ALTER TABLE insights_notification ADD COLUMN user_id uuid;
      -- add FK if possible
      BEGIN
        ALTER TABLE insights_notification
          ADD CONSTRAINT insights_notification_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
        -- constraint already exists under another name; ignore
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
END
$$;

-- Enable RLS safely
ALTER TABLE IF EXISTS insights_notification ENABLE ROW LEVEL SECURITY;

-- Policy self (guarded)
DO $$
BEGIN
  IF to_regclass('public.insights_notification') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_policies
       WHERE schemaname='public' AND tablename='insights_notification' AND policyname='insights_notification_self'
     )
  THEN
    CREATE POLICY "insights_notification_self" ON insights_notification
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- Create the index only if column 'sent_at' exists
DO $$
BEGIN
  IF to_regclass('public.insights_notification') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='insights_notification' AND column_name='sent_at'
     )
     AND NOT EXISTS (
       SELECT 1 FROM pg_indexes
       WHERE schemaname='public' AND indexname='idx_insights_user_time'
     )
  THEN
    CREATE INDEX idx_insights_user_time ON insights_notification(user_id, sent_at DESC);
  END IF;
END
$$;
