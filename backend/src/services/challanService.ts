import pool from "../config/db";

export interface ChallanInput {
  trip_id?: number;
  order_id?: number;
  vehicle_id?: number;
  driver_id?: number;
  quantity?: number;
}

export const getAllChallans = async (filters: { start?: number; end?: number; trip_id?: number } = {}) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (filters.trip_id) {
    conditions.push(`dc.trip_id = $${idx++}`);
    params.push(filters.trip_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const start = filters.start ?? 0;
  const end = filters.end ?? 9;
  params.push(end - start + 1, start);

  const result = await pool.query(
    `SELECT dc.*,
            c.name AS customer_name,
            v.plate_number,
            d.name AS driver_name,
            COUNT(*) OVER() AS _total_count
     FROM delivery_challans dc
     LEFT JOIN orders o    ON dc.order_id = o.id
     LEFT JOIN customers c ON o.customer_id = c.id
     LEFT JOIN vehicles v  ON dc.vehicle_id = v.id
     LEFT JOIN drivers d   ON dc.driver_id = d.id
     ${whereClause}
     ORDER BY dc.id DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  const total = result.rows.length ? parseInt(result.rows[0]._total_count) : 0;
  const challans = result.rows.map(({ _total_count, ...rest }) => rest);
  return { challans, total, start, end: challans.length === 0 ? 0 : Math.min(end, start + challans.length - 1) };
};

export const getChallanById = async (id: number) => {
  const result = await pool.query(
    `SELECT dc.*,
            c.name AS customer_name,
            o.delivery_address,
            v.plate_number,
            d.name AS driver_name
     FROM delivery_challans dc
     LEFT JOIN orders o    ON dc.order_id = o.id
     LEFT JOIN customers c ON o.customer_id = c.id
     LEFT JOIN vehicles v  ON dc.vehicle_id = v.id
     LEFT JOIN drivers d   ON dc.driver_id = d.id
     WHERE dc.id = $1`,
    [id]
  );
  return result.rows[0];
};

/**
 * Generate a delivery challan for a dispatch. Auto-assigns a challan number (CH-00001)
 * and flips the assigned vehicle to 'in_use'. All in one transaction.
 */
export const createChallan = async (data: ChallanInput) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO delivery_challans (challan_no, trip_id, order_id, vehicle_id, driver_id, quantity)
       VALUES ('PENDING', $1, $2, $3, $4, $5) RETURNING id`,
      [data.trip_id ?? null, data.order_id ?? null, data.vehicle_id ?? null, data.driver_id ?? null, data.quantity ?? null]
    );
    const id = inserted.rows[0].id;
    const updated = await client.query(
      `UPDATE delivery_challans SET challan_no = 'CH-' || LPAD(id::text, 5, '0') WHERE id = $1 RETURNING *`,
      [id]
    );
    if (data.vehicle_id) {
      await client.query("UPDATE vehicles SET status = 'in_use' WHERE id = $1", [data.vehicle_id]);
    }
    await client.query("COMMIT");
    return updated.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Dispatch board: trips with their current workflow state + customer/vehicle/driver labels.
export const getDispatchBoard = async () => {
  const result = await pool.query(
    `SELECT t.id, t.order_id, t.vehicle_id, t.driver_id, t.eta, t.volume_delivered,
            ws.name AS state_name, ws.slug AS state_slug, ws.color AS state_color,
            c.name AS customer_name,
            v.plate_number,
            d.name AS driver_name
     FROM trips t
     LEFT JOIN workflow_states ws ON t.workflow_state_id = ws.id
     LEFT JOIN orders o    ON t.order_id = o.id
     LEFT JOIN customers c ON o.customer_id = c.id
     LEFT JOIN vehicles v  ON t.vehicle_id = v.id
     LEFT JOIN drivers d   ON t.driver_id = d.id
     ORDER BY t.created_at DESC`
  );
  return result.rows;
};
