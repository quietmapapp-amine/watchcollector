-- Seed essential brands
INSERT INTO brand (name) VALUES
  ('Rolex'),
  ('Omega'),
  ('Patek Philippe'),
  ('Cartier'),
  ('Audemars Piguet'),
  ('Vacheron Constantin'),
  ('A. Lange & Söhne'),
  ('Jaeger-LeCoultre'),
  ('IWC Schaffhausen'),
  ('TAG Heuer'),
  ('Tudor'),
  ('Breitling'),
  ('Panerai'),
  ('Hublot'),
  ('Richard Mille');

-- Seed calibers
INSERT INTO caliber (name, service_interval_months, service_cost_low, service_cost_high) VALUES
  ('3135', 60, 800, 1200),
  ('3235', 60, 800, 1200),
  ('4130', 60, 1000, 1500),
  ('8500', 60, 600, 1000),
  ('8900', 60, 600, 1000),
  ('26-330 S C', 60, 2000, 3000),
  ('324 S C', 60, 1500, 2500),
  ('2121', 60, 800, 1200),
  ('3120', 60, 1000, 1500),
  ('L951.1', 60, 1200, 1800);

-- Seed models (Rolex)
INSERT INTO model (brand_id, name, reference, caliber_id, year_start, year_end) VALUES
  ((SELECT id FROM brand WHERE name = 'Rolex'), 'Submariner', '126610LN', (SELECT id FROM caliber WHERE name = '3235'), 2020, NULL),
  ((SELECT id FROM brand WHERE name = 'Rolex'), 'Submariner', '116610LN', (SELECT id FROM caliber WHERE name = '3135'), 2010, 2020),
  ((SELECT id FROM brand WHERE name = 'Rolex'), 'Daytona', '116500LN', (SELECT id FROM caliber WHERE name = '4130'), 2016, NULL),
  ((SELECT id FROM brand WHERE name = 'Rolex'), 'GMT-Master II', '126710BLRO', (SELECT id FROM caliber WHERE name = '3285'), 2018, NULL),
  ((SELECT id FROM brand WHERE name = 'Rolex'), 'Datejust', '126234', (SELECT id FROM caliber WHERE name = '3235'), 2018, NULL);

-- Seed models (Omega)
INSERT INTO model (brand_id, name, reference, caliber_id, year_start, year_end) VALUES
  ((SELECT id FROM brand WHERE name = 'Omega'), 'Speedmaster Professional', '311.30.42.30.01.005', (SELECT id FROM caliber WHERE name = '1861'), 1969, 2021),
  ((SELECT id FROM brand WHERE name = 'Omega'), 'Seamaster 300M', '210.30.42.20.03.001', (SELECT id FROM caliber WHERE name = '8800'), 2018, NULL),
  ((SELECT id FROM brand WHERE name = 'Omega'), 'Constellation', '131.10.39.20.01.001', (SELECT id FROM caliber WHERE name = '8500'), 2015, NULL);

-- Seed models (Patek Philippe)
INSERT INTO model (brand_id, name, reference, caliber_id, year_start, year_end) VALUES
  ((SELECT id FROM brand WHERE name = 'Patek Philippe'), 'Nautilus', '5711/1A-010', (SELECT id FROM caliber WHERE name = '26-330 S C'), 2006, 2021),
  ((SELECT id FROM brand WHERE name = 'Patek Philippe'), 'Calatrava', '5196G-001', (SELECT id FROM caliber WHERE name = '215 PS'), 1996, NULL);

-- Seed models (Cartier)
INSERT INTO model (brand_id, name, reference, caliber_id, year_start, year_end) VALUES
  ((SELECT id FROM brand WHERE name = 'Cartier'), 'Tank', 'WSTA0041', (SELECT id FROM caliber WHERE name = '1847 MC'), 2018, NULL),
  ((SELECT id FROM brand WHERE name = 'Cartier'), 'Santos', 'WSSA0010', (SELECT id FROM caliber WHERE name = '1847 MC'), 2018, NULL);

-- Seed models (Audemars Piguet)
INSERT INTO model (brand_id, name, reference, caliber_id, year_start, year_end) VALUES
  ((SELECT id FROM brand WHERE name = 'Audemars Piguet'), 'Royal Oak', '15500ST.OO.1220ST.01', (SELECT id FROM caliber WHERE name = '4302'), 2019, NULL),
  ((SELECT id FROM brand WHERE name = 'Audemars Piguet'), 'Royal Oak Offshore', '15710ST.OO.A002CA.01', (SELECT id FROM caliber WHERE name = '3126/3840'), 2015, NULL);

-- Seed service rules
INSERT INTO service_rule (brand_id, caliber_id, interval_months, cost_low, cost_high) VALUES
  ((SELECT id FROM brand WHERE name = 'Rolex'), (SELECT id FROM caliber WHERE name = '3135'), 60, 800, 1200),
  ((SELECT id FROM brand WHERE name = 'Rolex'), (SELECT id FROM caliber WHERE name = '3235'), 60, 800, 1200),
  ((SELECT id FROM brand WHERE name = 'Omega'), (SELECT id FROM caliber WHERE name = '8500'), 60, 600, 1000),
  ((SELECT id FROM brand WHERE name = 'Patek Philippe'), (SELECT id FROM caliber WHERE name = '26-330 S C'), 60, 2000, 3000);
