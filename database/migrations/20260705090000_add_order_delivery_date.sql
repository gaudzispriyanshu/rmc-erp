-- Card 0a: The code (orderService.ts) reads/writes orders.delivery_date. Ensure the column
-- exists, and backfill it from order_date -- but only if order_date is actually present
-- (some environments already replaced order_date with delivery_date by hand).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_date'
  ) THEN
    UPDATE orders SET delivery_date = order_date WHERE delivery_date IS NULL;
  END IF;
END $$;
