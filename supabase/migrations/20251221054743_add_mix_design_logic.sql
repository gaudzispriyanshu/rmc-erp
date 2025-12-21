-- 1. Create Mix Designs (The 'Recipes')
CREATE TABLE IF NOT EXISTS mix_designs (
    id SERIAL PRIMARY KEY,
    grade_name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'M20', 'M25'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Link Mix Designs to Inventory Items
CREATE TABLE IF NOT EXISTS mix_requirements (
    id SERIAL PRIMARY KEY,
    mix_id INTEGER REFERENCES mix_designs(id) ON DELETE CASCADE,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_per_m3 DECIMAL NOT NULL -- Amount of material needed for 1 cubic meter of concrete
);

-- 3. Update the Orders table to use the Mix Design ID instead of a text string
ALTER TABLE orders
ADD COLUMN mix_design_id INTEGER REFERENCES mix_designs(id);