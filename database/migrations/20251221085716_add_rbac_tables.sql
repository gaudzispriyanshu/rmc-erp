-- 1. Create Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create Permissions table (The "APIs" or "Actions")
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  action_slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'orders:write', 'inventory:read'
  description TEXT
);

-- 3. Junction table to link Roles to Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. Update Users table to have a Role
ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id);