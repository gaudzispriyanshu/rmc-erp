-- Card 5: Dispatch & Delivery Challan.
-- A challan is the delivery document generated for a trip (vehicle carrying concrete
-- to a site). One trip -> one challan in v1.

CREATE TABLE IF NOT EXISTS delivery_challans (
  id          SERIAL PRIMARY KEY,
  challan_no  VARCHAR(50) UNIQUE NOT NULL,
  trip_id     INTEGER REFERENCES trips(id) ON DELETE SET NULL,
  order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  vehicle_id  INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id   INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  quantity    NUMERIC,
  issued_at   TIMESTAMP DEFAULT NOW(),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_challans_trip ON delivery_challans(trip_id);
