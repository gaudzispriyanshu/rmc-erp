-- Card 6: Inventory & Stock.
-- Every change to an inventory item's stock is recorded as a movement (an append-only
-- ledger). Positive change_qty = stock in (purchase/adjustment), negative = consumption
-- (production/dispatch). inventory_items.current_stock is the running balance we keep in sync.

CREATE TABLE IF NOT EXISTS stock_movements (
  id                SERIAL PRIMARY KEY,
  inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  change_qty        NUMERIC NOT NULL,           -- + in, - out
  reason            TEXT,                        -- 'production' | 'purchase' | 'adjustment' | ...
  ref_type          VARCHAR(50),                 -- e.g. 'order'
  ref_id            INTEGER,                     -- e.g. order id that triggered consumption
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(inventory_item_id);
