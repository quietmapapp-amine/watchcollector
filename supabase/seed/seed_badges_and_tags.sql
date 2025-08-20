-- seed_badges_and_tags.sql

-- Badges (UPSERT by code)
insert into badge(code, name, description, icon_url) values
('ROLEX_ADDICT','Rolex Addict','Possède au moins 5 Rolex','/badges/rolex_addict.png'),
('DIVER_KING','Diver King','Possède au moins 3 plongeuses','/badges/diver_king.png'),
('VINTAGE_LOVER','Vintage Lover','Possède au moins 10 montres vintage','/badges/vintage_lover.png')
on conflict (code) do update set
  name=excluded.name,
  description=excluded.description,
  icon_url=excluded.icon_url;

-- Example tags for known models (extend as needed)
-- NOTE: Replace UUIDs with real model IDs from your catalog, or run after you have those.
-- Here we demonstrate pattern using name/reference matches for convenience.
with target_models as (
  select m.id, b.name as brand, m.name as model_name, m.reference
  from model m join brand b on b.id = m.brand_id
)
-- Divers (examples)
insert into model_tag(model_id, tag)
select id, 'diver'::tag_t from target_models
where (brand ilike 'rolex%' and (model_name ilike '%submariner%' or reference ilike '16610%' or reference ilike '116610%'))
   or (brand ilike 'omega%' and model_name ilike '%seamaster%')
on conflict do nothing;

-- Sport (examples)
insert into model_tag(model_id, tag)
select id, 'sport'::tag_t from target_models
where brand ilike 'rolex%' and (model_name ilike '%gmt%' or model_name ilike '%daytona%')
on conflict do nothing;

-- Dress (examples)
insert into model_tag(model_id, tag)
select id, 'dress'::tag_t from target_models
where brand ilike 'patek%' and model_name ilike '%calatrava%'
on conflict do nothing;

-- Vintage tagging heuristic (pre-2000)
insert into model_tag(model_id, tag)
select m.id, 'vintage'::tag_t
from model m
where coalesce(m.year_end, m.year_start) <= 1999
on conflict do nothing;
