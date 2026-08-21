-- Card 2: Configurable status workflow engine (a state machine).
--
-- Instead of a free-text `status` string, each entity type (order, trip, ...) gets a
-- named workflow. A workflow owns an ordered list of STATES, and a set of allowed
-- TRANSITIONS between those states. The backend later rejects any status change that
-- isn't a defined transition.

-- 1. A workflow = a named state machine for one entity type.
CREATE TABLE IF NOT EXISTS workflows (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50)  NOT NULL,          -- 'order' | 'trip' | 'vehicle' | ...
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 2. The nodes of the machine: the states a record can be in.
CREATE TABLE IF NOT EXISTS workflow_states (
  id          SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,          -- human label, e.g. 'In Production'
  slug        VARCHAR(50)  NOT NULL,          -- machine value, e.g. 'in_production'
  sort_order  INTEGER DEFAULT 0,             -- display order in the UI
  color       VARCHAR(20) DEFAULT '#64748b', -- badge color
  is_initial  BOOLEAN DEFAULT FALSE,          -- the state new records start in
  is_terminal BOOLEAN DEFAULT FALSE,          -- no transitions out (done/cancelled)
  UNIQUE (workflow_id, slug)
);

-- 3. The edges of the machine: which state may move to which.
--    A NULL from_state_id means "this is a valid entry point" (creating a record).
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id            SERIAL PRIMARY KEY,
  workflow_id   INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_state_id INTEGER REFERENCES workflow_states(id) ON DELETE CASCADE,
  to_state_id   INTEGER NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
  UNIQUE (from_state_id, to_state_id)
);

-- 4. Point the business tables at their current state.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS workflow_state_id INTEGER REFERENCES workflow_states(id);
ALTER TABLE trips  ADD COLUMN IF NOT EXISTS workflow_state_id INTEGER REFERENCES workflow_states(id);

-- ----------------------------------------------------------------------------
-- Seed the two default workflows. Kept inside the migration (not seed.sql) so the
-- backfill below has states to reference and `db reset` reproduces it exactly.
-- ----------------------------------------------------------------------------

-- Orders workflow
INSERT INTO workflows (name, entity_type, description)
VALUES ('Order Lifecycle', 'order', 'Default order status workflow');

INSERT INTO workflow_states (workflow_id, name, slug, sort_order, color, is_initial, is_terminal)
SELECT w.id, s.name, s.slug, s.sort_order, s.color, s.is_initial, s.is_terminal
FROM workflows w
CROSS JOIN (VALUES
  ('Pending',        'pending',        1, '#f59e0b', TRUE,  FALSE),
  ('Confirmed',      'confirmed',      2, '#3b82f6', FALSE, FALSE),
  ('In Production',  'in_production',  3, '#8b5cf6', FALSE, FALSE),
  ('Dispatched',     'dispatched',     4, '#0ea5e9', FALSE, FALSE),
  ('Delivered',      'delivered',      5, '#22c55e', FALSE, FALSE),
  ('Closed',         'closed',         6, '#64748b', FALSE, TRUE),
  ('Cancelled',      'cancelled',      7, '#ef4444', FALSE, TRUE)
) AS s(name, slug, sort_order, color, is_initial, is_terminal)
WHERE w.entity_type = 'order';

-- Trips workflow
INSERT INTO workflows (name, entity_type, description)
VALUES ('Trip Lifecycle', 'trip', 'Default trip/dispatch status workflow');

INSERT INTO workflow_states (workflow_id, name, slug, sort_order, color, is_initial, is_terminal)
SELECT w.id, s.name, s.slug, s.sort_order, s.color, s.is_initial, s.is_terminal
FROM workflows w
CROSS JOIN (VALUES
  ('Assigned',   'assigned',   1, '#f59e0b', TRUE,  FALSE),
  ('Started',    'started',    2, '#3b82f6', FALSE, FALSE),
  ('Delivered',  'delivered',  3, '#22c55e', FALSE, FALSE),
  ('Completed',  'completed',  4, '#64748b', FALSE, TRUE),
  ('Cancelled',  'cancelled',  5, '#ef4444', FALSE, TRUE)
) AS s(name, slug, sort_order, color, is_initial, is_terminal)
WHERE w.entity_type = 'trip';

-- ----------------------------------------------------------------------------
-- Seed transitions. Helper: look up a state id by (entity_type, slug).
-- Entry points use from_state_id = NULL.
-- ----------------------------------------------------------------------------
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id)
SELECT ws_to.workflow_id, ws_from.id, ws_to.id
FROM (VALUES
  -- order transitions (from_slug NULL = entry point)
  ('order', NULL,             'pending'),
  ('order', 'pending',        'confirmed'),
  ('order', 'confirmed',      'in_production'),
  ('order', 'in_production',  'dispatched'),
  ('order', 'dispatched',     'delivered'),
  ('order', 'delivered',      'closed'),
  ('order', 'pending',        'cancelled'),
  ('order', 'confirmed',      'cancelled'),
  ('order', 'in_production',  'cancelled'),
  -- trip transitions
  ('trip',  NULL,             'assigned'),
  ('trip',  'assigned',       'started'),
  ('trip',  'started',        'delivered'),
  ('trip',  'delivered',      'completed'),
  ('trip',  'assigned',       'cancelled'),
  ('trip',  'started',        'cancelled')
) AS t(entity_type, from_slug, to_slug)
JOIN workflows w         ON w.entity_type = t.entity_type
JOIN workflow_states ws_to
  ON ws_to.workflow_id = w.id AND ws_to.slug = t.to_slug
LEFT JOIN workflow_states ws_from
  ON ws_from.workflow_id = w.id AND ws_from.slug = t.from_slug;

-- ----------------------------------------------------------------------------
-- Backfill: translate the existing free-text status string into the matching
-- workflow_state_id. Unknown/legacy values fall back to the workflow's initial state.
-- ----------------------------------------------------------------------------
-- Orders: map legacy values onto the new slugs.
UPDATE orders o
SET workflow_state_id = ws.id
FROM workflow_states ws
JOIN workflows w ON w.id = ws.workflow_id AND w.entity_type = 'order'
WHERE ws.slug = CASE o.status
  WHEN 'pending'     THEN 'pending'
  WHEN 'confirmed'   THEN 'confirmed'
  WHEN 'in_progress' THEN 'in_production'
  WHEN 'in_production' THEN 'in_production'
  WHEN 'dispatched'  THEN 'dispatched'
  WHEN 'delivered'   THEN 'delivered'
  WHEN 'completed'   THEN 'delivered'
  WHEN 'closed'      THEN 'closed'
  WHEN 'cancelled'   THEN 'cancelled'
  ELSE 'pending'
END;

-- Any order still unmapped (null status) -> initial state.
UPDATE orders o
SET workflow_state_id = ws.id
FROM workflow_states ws
JOIN workflows w ON w.id = ws.workflow_id AND w.entity_type = 'order'
WHERE ws.is_initial = TRUE AND o.workflow_state_id IS NULL;

-- Trips
UPDATE trips tr
SET workflow_state_id = ws.id
FROM workflow_states ws
JOIN workflows w ON w.id = ws.workflow_id AND w.entity_type = 'trip'
WHERE ws.slug = CASE tr.status
  WHEN 'assigned'  THEN 'assigned'
  WHEN 'started'   THEN 'started'
  WHEN 'delivered' THEN 'delivered'
  WHEN 'completed' THEN 'completed'
  WHEN 'cancelled' THEN 'cancelled'
  ELSE 'assigned'
END;

UPDATE trips tr
SET workflow_state_id = ws.id
FROM workflow_states ws
JOIN workflows w ON w.id = ws.workflow_id AND w.entity_type = 'trip'
WHERE ws.is_initial = TRUE AND tr.workflow_state_id IS NULL;
