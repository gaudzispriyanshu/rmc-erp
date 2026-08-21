-- Register permission slugs for the new backend modules. This lives in a MIGRATION
-- (not seed.sql) so it reaches the cloud DB via `supabase db push` — seed.sql only runs
-- on local `db reset`. Idempotent via ON CONFLICT.

-- Existing permissions rows were inserted with explicit ids, leaving the SERIAL sequence
-- behind the real MAX(id). Realign it so new inserts get non-colliding ids.
SELECT setval(
  pg_get_serial_sequence('permissions', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM permissions)
);

INSERT INTO permissions (action_slug, description) VALUES
  ('orders:delete',    'Delete orders'),
  ('trips:update',     'Update trips'),
  ('trips:delete',     'Delete trips'),
  ('customers:read',   'View customers'),
  ('customers:write',  'Create customers'),
  ('customers:update', 'Update customers'),
  ('customers:delete', 'Delete customers'),
  ('drivers:read',     'View drivers'),
  ('drivers:write',    'Create drivers'),
  ('drivers:update',   'Update drivers'),
  ('drivers:delete',   'Delete drivers'),
  ('vehicles:read',    'View vehicles'),
  ('vehicles:write',   'Create vehicles'),
  ('vehicles:update',  'Update vehicles'),
  ('vehicles:delete',  'Delete vehicles'),
  ('mix_designs:read',   'View mix designs'),
  ('mix_designs:write',  'Create mix designs'),
  ('mix_designs:update', 'Update mix designs'),
  ('mix_designs:delete', 'Delete mix designs'),
  ('inventory:read',   'View inventory'),
  ('inventory:write',  'Create inventory items'),
  ('inventory:update', 'Update inventory / stock'),
  ('inventory:delete', 'Delete inventory items'),
  ('dispatch:read',    'View dispatch / challans'),
  ('dispatch:write',   'Create challans'),
  ('dispatch:update',  'Update dispatch'),
  ('quality:read',     'View QC records'),
  ('quality:write',    'Create QC records'),
  ('quality:update',   'Update QC records'),
  ('quality:delete',   'Delete QC records'),
  ('workflows:read',   'View workflows'),
  ('workflows:write',  'Edit workflows')
ON CONFLICT (action_slug) DO NOTHING;

-- Auto-grant every one of these new permissions to any role that is already an admin
-- (i.e. holds 'admin:write'). This keeps existing admin roles fully functional after the
-- migration without hard-coding a role name/id. Non-admin roles get nothing here — grant
-- those through the Security Roles screen in the UI.
INSERT INTO role_permissions (role_id, permission_id)
SELECT admin_rp.role_id, p.id
FROM permissions p
CROSS JOIN (
  SELECT rp.role_id
  FROM role_permissions rp
  JOIN permissions ap ON ap.id = rp.permission_id
  WHERE ap.action_slug = 'admin:write'
) AS admin_rp
WHERE p.action_slug IN (
  'orders:delete','trips:update','trips:delete',
  'customers:read','customers:write','customers:update','customers:delete',
  'drivers:read','drivers:write','drivers:update','drivers:delete',
  'vehicles:read','vehicles:write','vehicles:update','vehicles:delete',
  'mix_designs:read','mix_designs:write','mix_designs:update','mix_designs:delete',
  'inventory:read','inventory:write','inventory:update','inventory:delete',
  'dispatch:read','dispatch:write','dispatch:update',
  'quality:read','quality:write','quality:update','quality:delete',
  'workflows:read','workflows:write'
)
ON CONFLICT DO NOTHING;
