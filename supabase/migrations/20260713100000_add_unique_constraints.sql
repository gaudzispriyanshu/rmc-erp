-- ISSUE: prevent duplicate entries at the schema level.
-- API checks alone can't guarantee uniqueness (two concurrent requests both
-- pass the "does it exist?" check); only a DB constraint is race-proof.
-- Postgres UNIQUE treats NULLs as distinct, so rows without a license/GST
-- are unaffected.

-- De-dupe existing license numbers before adding the constraint.
-- Keeps the oldest row untouched; later duplicates get a visible
-- '-DUP-<id>' suffix instead of being deleted or nulled.
UPDATE drivers d
SET license_number = d.license_number || '-DUP-' || d.id
WHERE d.license_number IS NOT NULL
  AND d.id <> (
    SELECT MIN(d2.id) FROM drivers d2 WHERE d2.license_number = d.license_number
  );

ALTER TABLE drivers
  ADD CONSTRAINT drivers_license_number_key UNIQUE (license_number);

-- Customers had no GST column at all; add it (Indian GSTIN is 15 chars)
-- and make it unique in the same migration.
ALTER TABLE customers
  ADD COLUMN gst_number varchar(15);

ALTER TABLE customers
  ADD CONSTRAINT customers_gst_number_key UNIQUE (gst_number);
