jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from "../../config/db";
import { Request, Response } from "express";
import { idempotency } from "../idempotency";

const mockPool = pool as unknown as { query: jest.Mock };

beforeEach(() => mockPool.query.mockReset());

const mockRes = () => {
  const res: any = { statusCode: 200 };
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res as Response;
};

const mockReq = (key?: string, body: any = { quantity: 10 }) =>
  ({
    header: (name: string) => (name === "Idempotency-Key" ? key : undefined),
    body,
    method: "POST",
    baseUrl: "/api/orders",
    path: "/",
    user: { userId: 7, email: "t@t.com", roleId: 1 },
  } as unknown as Request);

// The middleware body is async; wait for next()/res.json to be called.
const run = (req: Request, res: Response) =>
  new Promise<jest.Mock>((resolve, reject) => {
    const next = jest.fn((err?: any) => (err ? reject(err) : resolve(next)));
    idempotency(req, res, next);
    // Also resolve when the middleware responds without calling next.
    (res.json as jest.Mock).mockImplementation(() => {
      resolve(next);
      return res;
    });
  });

describe("idempotency middleware", () => {
  it("passes straight through when no header is sent", async () => {
    const res = mockRes();
    const next = jest.fn();
    idempotency(mockReq(undefined), res, next);
    expect(next).toHaveBeenCalled();
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  it("executes the handler when the key is new", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ key: "k1" }] }); // INSERT won
    const res = mockRes();
    const next = await run(mockReq("k1"), res);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(409);
  });

  it("replays the stored response for a duplicate", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [] }) // INSERT lost (conflict)
      .mockResolvedValueOnce({
        rows: [
          {
            endpoint: "POST /api/orders/",
            request_hash: hashOf({ quantity: 10 }),
            response_status: 201,
            response_body: { id: 42 },
          },
        ],
      });
    const res = mockRes();
    const next = await run(mockReq("k1"), res);
    expect(next).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("Idempotency-Replayed", "true");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 42 });
  });

  it("rejects the same key used with a different body (422)", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            endpoint: "POST /api/orders/",
            request_hash: hashOf({ quantity: 999 }),
            response_status: 201,
            response_body: { id: 42 },
          },
        ],
      });
    const res = mockRes();
    const next = await run(mockReq("k1", { quantity: 10 }), res);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it("returns 409 while the first request is still in flight", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            endpoint: "POST /api/orders/",
            request_hash: hashOf({ quantity: 10 }),
            response_status: null,
            response_body: null,
          },
        ],
      });
    const res = mockRes();
    const next = await run(mockReq("k1"), res);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("stores a 2xx response and frees the key on failure", async () => {
    // Winning request whose handler later responds 201:
    mockPool.query.mockResolvedValue({ rows: [{ key: "k1" }] });
    const res = mockRes();
    const next = await run(mockReq("k1"), res);
    expect(next).toHaveBeenCalled();

    // res.json is now the middleware's wrapper — calling it must persist first.
    res.statusCode = 201;
    res.json({ id: 42 });
    expect(mockPool.query).toHaveBeenLastCalledWith(
      expect.stringContaining("UPDATE idempotency_keys"),
      [201, JSON.stringify({ id: 42 }), "k1", 7]
    );

    // A 5xx outcome deletes the row instead:
    mockPool.query.mockClear();
    mockPool.query.mockResolvedValue({ rows: [{ key: "k2" }] });
    const res2 = mockRes();
    const next2 = await run(mockReq("k2"), res2);
    expect(next2).toHaveBeenCalled();
    res2.statusCode = 500;
    res2.json({ error: "boom" });
    expect(mockPool.query).toHaveBeenLastCalledWith(
      expect.stringContaining("DELETE FROM idempotency_keys"),
      ["k2", 7]
    );
  });
});

function hashOf(body: any): string {
  return require("crypto").createHash("sha256").update(JSON.stringify(body)).digest("hex");
}
