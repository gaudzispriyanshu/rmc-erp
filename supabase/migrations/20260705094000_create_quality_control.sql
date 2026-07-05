-- Card 7: Quality Control.
-- Mix design approval + concrete test records (cube / slump) + non-conformance log.

-- Mix design approval status (simple field; the QC team approves a recipe before use).
ALTER TABLE mix_designs ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';

-- Compressive strength cube tests (typically at 7 and 28 days).
CREATE TABLE IF NOT EXISTS cube_tests (
  id                   SERIAL PRIMARY KEY,
  order_id             INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  mix_design_id        INTEGER REFERENCES mix_designs(id) ON DELETE SET NULL,
  sample_id            VARCHAR(50),
  test_date            DATE,
  age_days             INTEGER,                 -- 7, 28, ...
  compressive_strength NUMERIC,                 -- N/mm^2 (MPa)
  passed               BOOLEAN,
  remarks              TEXT,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- Slump / workability tests taken at the plant or site.
CREATE TABLE IF NOT EXISTS slump_tests (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  slump_value NUMERIC,                          -- mm
  test_date   DATE,
  passed      BOOLEAN,
  remarks     TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Non-conformance reports (something went out of spec).
CREATE TABLE IF NOT EXISTS non_conformance (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  severity    VARCHAR(20) DEFAULT 'minor',       -- 'minor' | 'major' | 'critical'
  status      VARCHAR(20) DEFAULT 'open',        -- 'open' | 'closed'
  reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
