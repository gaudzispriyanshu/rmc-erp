import pool from "../config/db";
import { isTransitionAllowed, getStateById } from "./workflowService";
import { AppError } from "../errors/AppError";

interface CreateTripInput {
    order_id: number;
    vehicle_id: number;
    driver_id: number;
    assigned_by: number;
    status?: string;
    eta: Date;
    started_at?: Date;
    completed_at?: Date;
    volume_delivered?: number;
    fuel_cost_estimate?: number;
}

export const createTrip = async (tripData: CreateTripInput) => {
    const { order_id, vehicle_id, driver_id, assigned_by, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate } = tripData;
    // workflow_state_id set to the 'trip' workflow's initial state; status defaults to 'assigned'.
    const result = await pool.query(
        `
        INSERT INTO trips (order_id, vehicle_id, driver_id, assigned_by, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate, workflow_state_id)
        VALUES ($1, $2, $3, $4, COALESCE($5, 'assigned'), $6, $7, $8, $9, $10,
            (SELECT ws.id FROM workflow_states ws
             JOIN workflows w ON w.id = ws.workflow_id
             WHERE w.entity_type = 'trip' AND w.is_active = TRUE AND ws.is_initial = TRUE
             LIMIT 1))
        RETURNING *
        `,
        [order_id, vehicle_id, driver_id, assigned_by, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate]
    );
    return result.rows[0];
}

const TRIP_UPDATE_FIELDS = ["order_id", "vehicle_id", "driver_id", "eta", "started_at", "completed_at", "volume_delivered", "fuel_cost_estimate"] as const;

export const updateTrip = async (id: number, data: Record<string, any>) => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const key of TRIP_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const result = await pool.query(
        `UPDATE trips SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
    );
    return result.rows[0];
};

export const deleteTrip = async (id: number) => {
    const result = await pool.query("DELETE FROM trips WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};

/**
 * Advance a trip to a new workflow state (transition-guarded) and record the change in
 * trip_updates as an audit row. Sets started_at/completed_at as the trip progresses.
 * Throws Error("NOT_FOUND") or Error("ILLEGAL_TRANSITION").
 */
export const changeTripStatus = async (
    tripId: number,
    toStateId: number,
    extra: { note?: string; location?: any } = {}
) => {
    const current = await pool.query("SELECT workflow_state_id FROM trips WHERE id = $1", [tripId]);
    if (current.rows.length === 0) throw new AppError(404, "Trip not found");

    const fromStateId: number | null = current.rows[0].workflow_state_id;
    const allowed = await isTransitionAllowed(fromStateId, toStateId);
    if (!allowed) throw new AppError(400, "That status change is not allowed by the workflow.");

    const toState = await getStateById(toStateId);
    if (!toState) throw new AppError(400, "That status change is not allowed by the workflow.");

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Stamp lifecycle timestamps based on the target slug.
        const timestampSet =
            toState.slug === "started" ? ", started_at = NOW()"
          : (toState.slug === "delivered" || toState.slug === "completed") ? ", completed_at = NOW()"
          : "";

        const updated = await client.query(
            `UPDATE trips SET workflow_state_id = $1, status = $2 ${timestampSet} WHERE id = $3 RETURNING *`,
            [toStateId, toState.slug, tripId]
        );

        // Audit trail row.
        await client.query(
            `INSERT INTO trip_updates (trip_id, location, note, status) VALUES ($1, $2, $3, $4)`,
            [tripId, extra.location ? JSON.stringify(extra.location) : null, extra.note ?? null, toState.slug]
        );

        await client.query("COMMIT");
        return updated.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const getTripUpdates = async (tripId: number) => {
    const result = await pool.query(
        "SELECT * FROM trip_updates WHERE trip_id = $1 ORDER BY created_at ASC",
        [tripId]
    );
    return result.rows;
};

export const getAllTrips = async (filters: {
    start?: number;
    end?: number;
    status?: string;
    order_id?: number;
    vehicle_id?: number;
    driver_id?: number;
    assigned_by?: number;
    started_at?: Date;
    completed_at?: Date;
}) => {

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    // status filter
    if (filters.status && filters.status !== 'all') {
        conditions.push(`trips.status = $${idx++}`);
        params.push(filters.status);
    }

    // order_id filter
    if (filters.order_id) {
        conditions.push(`trips.order_id = $${idx++}`);
        params.push(filters.order_id);
    }

    // vehicle_id filter
    if (filters.vehicle_id) {
        conditions.push(`trips.vehicle_id = $${idx++}`);
        params.push(filters.vehicle_id);
    }

    // driver_id filter
    if (filters.driver_id) {
        conditions.push(`trips.driver_id = $${idx++}`);
        params.push(filters.driver_id);
    }

    // assigned_by filter
    if (filters.assigned_by) {
        conditions.push(`trips.assigned_by = $${idx++}`);
        params.push(filters.assigned_by);
    }

    // started_at filter
    if (filters.started_at) {
        conditions.push(`trips.started_at >= $${idx++}`);
        params.push(filters.started_at);
    }

    // completed_at filter
    if (filters.completed_at) {
        conditions.push(`trips.completed_at <= $${idx++}`);
        params.push(filters.completed_at);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const start = filters.start || 0;
    const end = filters.end || 9;
    const limit = end - start + 1;
    const offset = start;
    params.push(limit, offset);

    const tripsQuery = `
        SELECT 
                t.*,
                o.id AS order_id,
                o.delivery_address,
                c.name AS customer_name,
                d.name AS driver_name,
                COUNT(*) OVER() AS _total_count
            FROM trips t
            LEFT JOIN orders o ON t.order_id = o.id
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            ${whereClause}
            ORDER BY t.created_at DESC
            LIMIT $${idx++} OFFSET $${idx++}
    `;

    const tripResult = await pool.query(tripsQuery, params);

    const total = tripResult.rows.length > 0
        ? parseInt(tripResult.rows[0]._total_count)
        : 0;
    const trips = tripResult.rows.map(({ _total_count, ...rest }) => rest);

    return {
        trips,
        total,
        start,
        end: trips.length == 0 ? 0 : Math.min(end, start + trips.length - 1),
    };

}

export const getTripById = async (id: number) => {
    const tripQuery = `
         SELECT 
                t.*,
                o.id AS order_id,
                o.delivery_address,
                c.name AS customer_name,
                d.name AS driver_name
            FROM trips t
            LEFT JOIN orders o ON t.order_id = o.id
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            WHERE t.id = $1
            LIMIT 1
    `
    const tripResult = await pool.query(tripQuery, [id]);
    return tripResult.rows[0];
}



