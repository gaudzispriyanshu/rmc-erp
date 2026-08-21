-- Seed data, auto-loaded after migrations on `supabase db reset` (see config.toml [db.seed]).
-- Provides a working, logged-in-able system + demo data for QA / interview demos.
-- Idempotent: safe to run repeatedly.

-- pgcrypto gives us crypt()/gen_salt('bf') to produce a bcrypt hash that bcryptjs can verify.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
INSERT INTO roles (name, description) VALUES
  ('Admin',         'Full system access'),
  ('Dispatch',      'Dispatch & trips'),
  ('Plant Manager', 'Production & inventory'),
  ('Finance',       'Billing & finance')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Permissions (module:action)
-- ---------------------------------------------------------------------------
INSERT INTO permissions (action_slug, description) VALUES
  ('orders:read',      'View orders'),
  ('orders:write',     'Create orders'),
  ('orders:update',    'Update orders'),
  ('orders:delete',    'Delete orders'),
  ('trips:read',       'View trips'),
  ('trips:write',      'Create trips'),
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
  ('workflows:write',  'Edit workflows'),
  ('admin:read',       'View roles/permissions'),
  ('admin:write',      'Create roles'),
  ('admin:update',     'Update role permissions'),
  ('admin:delete',     'Delete roles')
ON CONFLICT (action_slug) DO NOTHING;

-- Admin gets every permission.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Admin user  (login: admin@rmc.local / admin123)
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password, name, role_id)
SELECT 'admin@rmc.local', crypt('admin123', gen_salt('bf')), 'Admin', r.id
FROM roles r WHERE r.name = 'Admin'
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Demo master data
-- ---------------------------------------------------------------------------
INSERT INTO customers (name, email, phone) VALUES
  ('Skyline Builders',  'contact@skyline.example',  '9800000001'),
  ('Metro Infra Ltd',   'info@metroinfra.example',  '9800000002'),
  ('Green Homes',       'hello@greenhomes.example', '9800000003')
ON CONFLICT DO NOTHING;

INSERT INTO drivers (name, phone, license_number, status, base_salary, per_trip_rate) VALUES
  ('Ramesh Kumar', '9811100001', 'DL-01-2020-111', 'active', 18000, 250),
  ('Suresh Yadav', '9811100002', 'DL-01-2019-222', 'active', 18000, 250),
  ('Amit Singh',   '9811100003', 'DL-01-2021-333', 'active', 18000, 250)
ON CONFLICT DO NOTHING;

INSERT INTO vehicles (plate_number, model, capacity, status) VALUES
  ('DL-01-AB-1234', 'Transit Mixer 6m3', 6, 'available'),
  ('DL-01-AB-5678', 'Transit Mixer 8m3', 8, 'available'),
  ('DL-01-AB-9012', 'Transit Mixer 6m3', 6, 'available')
ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO inventory_items (name, current_stock, unit, min_stock_level) VALUES
  ('OPC 53 Cement', 50000, 'kg', 5000),
  ('Coarse Aggregate 20mm', 120000, 'kg', 10000),
  ('Fine Aggregate (Sand)', 90000, 'kg', 10000),
  ('Water', 50000, 'litre', 2000),
  ('Admixture (Superplasticizer)', 2000, 'litre', 200)
ON CONFLICT DO NOTHING;

INSERT INTO mix_designs (grade_name, description, approval_status) VALUES
  ('M20', 'Standard M20 grade concrete', 'approved'),
  ('M25', 'Standard M25 grade concrete', 'approved'),
  ('M30', 'Standard M30 grade concrete', 'pending')
ON CONFLICT (grade_name) DO NOTHING;

-- Mix requirements (kg or litre per m3) for M20.
INSERT INTO mix_requirements (mix_id, inventory_item_id, quantity_per_m3)
SELECT md.id, ii.id, req.qty
FROM mix_designs md
JOIN (VALUES
  ('OPC 53 Cement', 320.0),
  ('Coarse Aggregate 20mm', 1200.0),
  ('Fine Aggregate (Sand)', 600.0),
  ('Water', 160.0),
  ('Admixture (Superplasticizer)', 3.0)
) AS req(item_name, qty) ON TRUE
JOIN inventory_items ii ON ii.name = req.item_name
WHERE md.grade_name = 'M20'
  AND NOT EXISTS (
    SELECT 1 FROM mix_requirements mr WHERE mr.mix_id = md.id AND mr.inventory_item_id = ii.id
  );

-- Demo orders, placed into workflow states by slug.
INSERT INTO orders (customer_id, mix_design_id, quantity, status, delivery_address, order_date, delivery_date, workflow_state_id)
SELECT c.id, md.id, o.qty, o.slug, o.addr, NOW(), NOW() + (o.days::text || ' days')::interval, ws.id
FROM (VALUES
  ('Skyline Builders', 'M20', 30.0, 'pending',       'Plot 12, Sector 62, Noida',      1),
  ('Metro Infra Ltd',  'M25', 50.0, 'in_production',  'Dwarka Expressway, Gurugram',    2),
  ('Green Homes',      'M20', 20.0, 'delivered',      'Whitefield, Bengaluru',         -1)
) AS o(cust, grade, qty, slug, addr, days)
JOIN customers c ON c.name = o.cust
JOIN mix_designs md ON md.grade_name = o.grade
JOIN workflows w ON w.entity_type = 'order'
JOIN workflow_states ws ON ws.workflow_id = w.id AND ws.slug = o.slug
WHERE NOT EXISTS (SELECT 1 FROM orders ex WHERE ex.delivery_address = o.addr);
