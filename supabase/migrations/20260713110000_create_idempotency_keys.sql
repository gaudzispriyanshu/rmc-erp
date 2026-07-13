-- Idempotency keys for critical POST endpoints (orders, trips, challans,
-- stock movements). The client sends an Idempotency-Key header; the first
-- request stores its response here and duplicates replay it instead of
-- re-executing. Keys are scoped per user so one user's key can never
-- collide with (or poison) another's.
CREATE TABLE idempotency_keys (
  key text NOT NULL,
  user_id integer NOT NULL,
  endpoint text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (key, user_id)
);

-- For purging old keys (they only need to outlive a retry window).
CREATE INDEX idempotency_keys_created_at_idx ON idempotency_keys (created_at);
