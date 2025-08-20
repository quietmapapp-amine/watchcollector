-- Seed badges for the Watch Collector app
INSERT INTO badge (name, rule, icon_url, description, category) VALUES
  -- Collection badges
  ('Premier Pas', 'Add your first watch', '🏆', 'Welcome to the world of watch collecting!', 'achievement'),
  ('Collectionneur', 'Add 5 watches to your collection', '📚', 'You are building a serious collection', 'collection'),
  ('Passionné', 'Add 10 watches to your collection', '🔥', 'Your passion for watches is undeniable', 'collection'),
  ('Expert', 'Add 20 watches to your collection', '👑', 'You have reached expert collector status', 'collection'),
  
  -- Brand-specific badges
  ('Rolex Addict', 'Add 5+ Rolex watches', '👑', 'The crown has captured your heart', 'collection'),
  ('Omega Enthusiast', 'Add 3+ Omega watches', '🌊', 'You appreciate precision and heritage', 'collection'),
  ('Patek Collector', 'Add 2+ Patek Philippe watches', '💎', 'You collect the finest timepieces', 'collection'),
  ('Swiss Made', 'Add 10+ Swiss watches', '🇨🇭', 'You value Swiss craftsmanship', 'collection'),
  
  -- Style badges
  ('Sportif', 'Add 5+ sport watches', '🏃', 'You love active and adventurous timepieces', 'collection'),
  ('Élégant', 'Add 5+ dress watches', '🎩', 'You appreciate classic elegance', 'collection'),
  ('Vintage Lover', 'Add 5+ vintage watches (pre-1990)', '🕰️', 'You cherish horological history', 'collection'),
  ('Diver King', 'Add 3+ dive watches', '🤿', 'You are ready for any underwater adventure', 'collection'),
  
  -- Social badges
  ('Partageur', 'Make your profile public', '🌍', 'You share your passion with the world', 'social'),
  ('Connecté', 'Add 5+ friends', '🤝', 'You are building a community', 'social'),
  ('Influenceur', 'Have 10+ followers', '⭐', 'Your collection inspires others', 'social'),
  
  -- Premium badges
  ('Premium', 'Upgrade to premium', '💎', 'You have unlocked premium features', 'premium'),
  ('Exporteur', 'Export your collection', '📤', 'You document your collection professionally', 'premium'),
  ('Analyste', 'View advanced analytics', '📊', 'You understand your collection deeply', 'premium');

-- Seed market baseline data (last 30 days)
INSERT INTO market_baseline (date, gold_price_eur, sp500_price_eur) VALUES
  (CURRENT_DATE - INTERVAL '30 days', 1850.50, 4200.00),
  (CURRENT_DATE - INTERVAL '29 days', 1852.30, 4210.50),
  (CURRENT_DATE - INTERVAL '28 days', 1848.90, 4195.20),
  (CURRENT_DATE - INTERVAL '27 days', 1855.10, 4220.80),
  (CURRENT_DATE - INTERVAL '26 days', 1853.70, 4215.40),
  (CURRENT_DATE - INTERVAL '25 days', 1857.20, 4230.60),
  (CURRENT_DATE - INTERVAL '24 days', 1854.80, 4225.90),
  (CURRENT_DATE - INTERVAL '23 days', 1859.40, 4240.20),
  (CURRENT_DATE - INTERVAL '22 days', 1856.90, 4235.70),
  (CURRENT_DATE - INTERVAL '21 days', 1861.60, 4250.40),
  (CURRENT_DATE - INTERVAL '20 days', 1859.20, 4245.80),
  (CURRENT_DATE - INTERVAL '19 days', 1863.80, 4260.10),
  (CURRENT_DATE - INTERVAL '18 days', 1861.40, 4255.60),
  (CURRENT_DATE - INTERVAL '17 days', 1865.90, 4270.30),
  (CURRENT_DATE - INTERVAL '16 days', 1863.50, 4265.70),
  (CURRENT_DATE - INTERVAL '15 days', 1867.20, 4280.50),
  (CURRENT_DATE - INTERVAL '14 days', 1864.80, 4275.90),
  (CURRENT_DATE - INTERVAL '13 days', 1868.50, 4290.20),
  (CURRENT_DATE - INTERVAL '12 days', 1866.10, 4285.60),
  (CURRENT_DATE - INTERVAL '11 days', 1869.80, 4300.40),
  (CURRENT_DATE - INTERVAL '10 days', 1867.40, 4295.80),
  (CURRENT_DATE - INTERVAL '9 days', 1870.90, 4310.50),
  (CURRENT_DATE - INTERVAL '8 days', 1868.50, 4305.90),
  (CURRENT_DATE - INTERVAL '7 days', 1871.20, 4320.60),
  (CURRENT_DATE - INTERVAL '6 days', 1868.80, 4315.90),
  (CURRENT_DATE - INTERVAL '5 days', 1872.50, 4330.40),
  (CURRENT_DATE - INTERVAL '4 days', 1870.10, 4325.80),
  (CURRENT_DATE - INTERVAL '3 days', 1873.80, 4340.50),
  (CURRENT_DATE - INTERVAL '2 days', 1871.40, 4335.90),
  (CURRENT_DATE - INTERVAL '1 day', 1874.20, 4345.60),
  (CURRENT_DATE, 1871.80, 4340.20);

-- Seed sample market metrics for popular models
INSERT INTO market_metrics (model_id, liquidity_index, rarity_index, active_listings_count, volume_sold_12m, market_trend) VALUES
  ((SELECT id FROM model WHERE reference = '126610LN' LIMIT 1), 45.2, 0.87, 12, 156, 'rising'),
  ((SELECT id FROM model WHERE reference = '116500LN' LIMIT 1), 67.8, 0.92, 8, 89, 'stable'),
  ((SELECT id FROM model WHERE reference = '5711/1A-010' LIMIT 1), 89.5, 0.95, 3, 23, 'rising'),
  ((SELECT id FROM model WHERE reference = '15500ST.OO.1220ST.01' LIMIT 1), 34.1, 0.78, 18, 234, 'stable'),
  ((SELECT id FROM model WHERE reference = '311.30.42.30.01.005' LIMIT 1), 23.4, 0.65, 45, 567, 'declining');
