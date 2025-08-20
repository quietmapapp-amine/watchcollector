-- 0002_app_improvements.sql (idempotent)

create extension if not exists pgcrypto;

-- Example: triggers & functions should be OR REPLACE
-- Serial hashing demo trigger
create or replace function fn_set_serial_hash() returns trigger language plpgsql as $$
begin
  if new.serial is not null then
    new.serial := new.serial; -- keep plaintext or remove if not needed
  end if;
  return new;
end $$;

drop trigger if exists trg_set_serial_hash on watch_instance;
create trigger trg_set_serial_hash
  before insert or update of serial on watch_instance
  for each row execute procedure fn_set_serial_hash();

-- Free tier cap enforcement (example)
create or replace function fn_enforce_free_cap() returns trigger language plpgsql as $$
declare free_cap int := 5;
begin
  -- here we assume 'profile.tier' exists; guard if needed
  if exists(select 1 from profile p where p.id = new.user_id and coalesce(p.tier,'free')='free') then
    if (select count(*) from watch_instance w where w.user_id=new.user_id) >= free_cap then
      raise exception 'FREE_TIER_LIMIT_REACHED';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_enforce_free_cap on watch_instance;
create trigger trg_enforce_free_cap
  before insert on watch_instance
  for each row execute procedure fn_enforce_free_cap();

-- Recompute aggregates on change (placeholder)
create or replace function fn_after_watch_change() returns trigger language plpgsql as $$
begin
  return new;
end $$;

drop trigger if exists trg_after_watch_change on watch_instance;
create trigger trg_after_watch_change
  after insert or update or delete on watch_instance
  for each row execute procedure fn_after_watch_change();

-- Helpful indexes (idempotent)
create index if not exists idx_watch_user on watch_instance(user_id);
create index if not exists idx_model_ref on model(reference);
create index if not exists idx_price_snapshot_model_time on price_snapshot(model_id, captured_at desc);
