-- Card 0b: users had both a legacy `role` string and the RBAC `role_id` FK.
-- role_id (joined to roles.name) is the single source of truth, so we drop the
-- redundant string column. authService.ts has been updated to stop reading/writing it.
--
-- Guard the backfill so it only runs while the legacy `role` column still exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    UPDATE users u
    SET role_id = r.id
    FROM roles r
    WHERE u.role_id IS NULL
      AND u.role IS NOT NULL
      AND r.name = u.role;
  END IF;
END $$;

ALTER TABLE users DROP COLUMN IF EXISTS role;
