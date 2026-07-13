import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import pool from "../config/db";

// Replay protection for critical POSTs (duplicate clicks, network retries).
//
// Client sends an Idempotency-Key header (any unique string, e.g. a UUID).
// - First request with a key: executes normally; a 2xx response is stored.
// - Duplicate with the same key + same body: stored response is replayed
//   (marked with an Idempotency-Replayed: true header), nothing re-executes.
// - Same key but a different body: 422 — the client is misusing the key.
// - Duplicate while the first is still running: 409 — retry shortly.
// - Non-2xx outcome: the key is freed so the client may retry with it.
//
// The INSERT ... ON CONFLICT DO NOTHING is the atomic gate: of two
// concurrent requests with the same key, exactly one wins the insert and
// executes; a check-then-insert in the controller could let both through.
//
// Mount AFTER authenticate (needs req.user) and AFTER validate (hashes the
// parsed, stripped body). Requests without the header pass through — the
// header is opt-in for clients.
export const idempotency = (req: Request, res: Response, next: NextFunction) => {
  const key = req.header("Idempotency-Key");
  if (!key) return next();
  if (key.length > 100) {
    return res.status(400).json({ error: "Idempotency-Key must be 100 characters or fewer." });
  }

  const userId = req.user?.userId ?? 0;
  const endpoint = `${req.method} ${req.baseUrl}${req.path}`;
  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(req.body ?? {}))
    .digest("hex");

  (async () => {
    const inserted = await pool.query(
      `INSERT INTO idempotency_keys (key, user_id, endpoint, request_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key, user_id) DO NOTHING
       RETURNING key`,
      [key, userId, endpoint, requestHash]
    );

    if (inserted.rows.length === 0) {
      // Key already used — decide between replay, misuse, and in-flight.
      const existing = await pool.query(
        `SELECT endpoint, request_hash, response_status, response_body
         FROM idempotency_keys WHERE key = $1 AND user_id = $2`,
        [key, userId]
      );
      const row = existing.rows[0];
      if (!row) {
        // Freed between our INSERT and SELECT (first attempt failed) — rare;
        // client should simply retry.
        return res.status(409).json({ error: "Please retry this request." });
      }
      if (row.endpoint !== endpoint || row.request_hash !== requestHash) {
        return res.status(422).json({
          error: "This Idempotency-Key was already used for a different request.",
        });
      }
      if (row.response_status === null) {
        return res.status(409).json({
          error: "A request with this Idempotency-Key is still being processed.",
        });
      }
      res.setHeader("Idempotency-Replayed", "true");
      return res.status(row.response_status).json(row.response_body);
    }

    // We won the insert — run the real handler and record its outcome.
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const status = res.statusCode;
      if (status >= 200 && status < 300) {
        pool
          .query(
            `UPDATE idempotency_keys
             SET response_status = $1, response_body = $2
             WHERE key = $3 AND user_id = $4`,
            [status, JSON.stringify(body), key, userId]
          )
          .catch((err) => console.error("Idempotency store error:", err.message));
      } else {
        pool
          .query(`DELETE FROM idempotency_keys WHERE key = $1 AND user_id = $2`, [key, userId])
          .catch((err) => console.error("Idempotency release error:", err.message));
      }
      return originalJson(body);
    };
    next();
  })().catch(next);
};
