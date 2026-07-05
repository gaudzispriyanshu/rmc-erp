import pool from "../config/db";

export interface InventoryItemInput {
  name: string;
  current_stock?: number;
  unit?: string;
  min_stock_level?: number;
}

const ITEM_FIELDS = ["name", "current_stock", "unit", "min_stock_level"] as const;

// ===== inventory_items CRUD =====

export const getAllInventoryItems = async (filters: { start?: number; end?: number; search?: string } = {}) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(`name ILIKE $${idx++}`);
    params.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const start = filters.start ?? 0;
  const end = filters.end ?? 9;
  params.push(end - start + 1, start);

  const result = await pool.query(
    `SELECT *, COUNT(*) OVER() AS _total_count
     FROM inventory_items ${whereClause}
     ORDER BY id DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  const total = result.rows.length ? parseInt(result.rows[0]._total_count) : 0;
  const items = result.rows.map(({ _total_count, ...rest }) => rest);
  return { items, total, start, end: items.length === 0 ? 0 : Math.min(end, start + items.length - 1) };
};

export const getInventoryItemById = async (id: number) => {
  const result = await pool.query("SELECT * FROM inventory_items WHERE id = $1", [id]);
  return result.rows[0];
};

export const createInventoryItem = async (data: InventoryItemInput) => {
  const result = await pool.query(
    `INSERT INTO inventory_items (name, current_stock, unit, min_stock_level)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.name, data.current_stock ?? 0, data.unit ?? null, data.min_stock_level ?? 0]
  );
  return result.rows[0];
};

export const updateInventoryItem = async (id: number, data: Partial<InventoryItemInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ITEM_FIELDS) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE inventory_items SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteInventoryItem = async (id: number) => {
  const result = await pool.query("DELETE FROM inventory_items WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// ===== stock movements =====

export const getStockMovements = async (itemId?: number) => {
  if (itemId) {
    const result = await pool.query(
      "SELECT * FROM stock_movements WHERE inventory_item_id = $1 ORDER BY created_at DESC",
      [itemId]
    );
    return result.rows;
  }
  const result = await pool.query("SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 200");
  return result.rows;
};

export const getLowStockItems = async () => {
  const result = await pool.query(
    `SELECT * FROM inventory_items
     WHERE min_stock_level IS NOT NULL AND current_stock < min_stock_level
     ORDER BY (current_stock - min_stock_level) ASC`
  );
  return result.rows;
};

/**
 * Record a single stock movement and keep inventory_items.current_stock in sync,
 * atomically. change_qty is positive for stock-in, negative for consumption.
 */
export const recordStockMovement = async (params: {
  inventory_item_id: number;
  change_qty: number;
  reason?: string;
  ref_type?: string;
  ref_id?: number;
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const movement = await client.query(
      `INSERT INTO stock_movements (inventory_item_id, change_qty, reason, ref_type, ref_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [params.inventory_item_id, params.change_qty, params.reason ?? null, params.ref_type ?? null, params.ref_id ?? null]
    );
    await client.query(
      `UPDATE inventory_items SET current_stock = COALESCE(current_stock, 0) + $1 WHERE id = $2`,
      [params.change_qty, params.inventory_item_id]
    );
    await client.query("COMMIT");
    return movement.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Auto-deduct raw materials for an order based on its mix design's bill of materials.
 * For each material: consumption = quantity_per_m3 * order.quantity. Writes one negative
 * stock movement per material and decrements current_stock — all in one transaction, so a
 * failure part-way leaves inventory untouched.
 */
export const consumeStockForOrder = async (orderId: number) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      "SELECT id, mix_design_id, quantity FROM orders WHERE id = $1",
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (!order.mix_design_id) throw new Error(`Order ${orderId} has no mix design`);

    const reqRes = await client.query(
      `SELECT mr.inventory_item_id, mr.quantity_per_m3, ii.name
       FROM mix_requirements mr
       JOIN inventory_items ii ON ii.id = mr.inventory_item_id
       WHERE mr.mix_id = $1`,
      [order.mix_design_id]
    );

    const movements: any[] = [];
    for (const req of reqRes.rows) {
      const consumed = Number(req.quantity_per_m3) * Number(order.quantity);
      const movement = await client.query(
        `INSERT INTO stock_movements (inventory_item_id, change_qty, reason, ref_type, ref_id)
         VALUES ($1, $2, 'production', 'order', $3) RETURNING *`,
        [req.inventory_item_id, -consumed, orderId]
      );
      await client.query(
        `UPDATE inventory_items SET current_stock = COALESCE(current_stock, 0) - $1 WHERE id = $2`,
        [consumed, req.inventory_item_id]
      );
      movements.push({ ...movement.rows[0], item_name: req.name });
    }

    await client.query("COMMIT");
    return { orderId, movements };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
