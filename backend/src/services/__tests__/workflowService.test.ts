jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn(), connect: jest.fn() },
}));

import pool from "../../config/db";
import { isTransitionAllowed, getAllowedNextStates, saveTransitions } from "../workflowService";

const mockPool = pool as unknown as { query: jest.Mock; connect: jest.Mock };

beforeEach(() => {
  mockPool.query.mockReset();
  mockPool.connect.mockReset();
});

describe("isTransitionAllowed", () => {
  it("allows a transition that exists", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });
    await expect(isTransitionAllowed(1, 2)).resolves.toBe(true);
  });

  it("rejects a transition that does not exist", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });
    await expect(isTransitionAllowed(3, 9)).resolves.toBe(false);
  });

  it("treats a null from-state as an entry-point check (IS NOT DISTINCT FROM)", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });
    await expect(isTransitionAllowed(null, 1)).resolves.toBe(true);
    // NULL is passed as the parameter, not compared with plain "=".
    expect(mockPool.query.mock.calls[0][1]).toEqual([null, 1]);
  });
});

describe("getAllowedNextStates", () => {
  it("returns the reachable states", async () => {
    const rows = [{ id: 2, slug: "confirmed" }, { id: 7, slug: "cancelled" }];
    mockPool.query.mockResolvedValueOnce({ rows });
    await expect(getAllowedNextStates(1)).resolves.toEqual(rows);
  });
});

describe("saveTransitions", () => {
  it("commits when every insert succeeds", async () => {
    const client = { query: jest.fn().mockResolvedValue({ rows: [] }), release: jest.fn() };
    mockPool.connect.mockResolvedValueOnce(client);

    const result = await saveTransitions(1, [
      { from_state_id: null, to_state_id: 1 },
      { from_state_id: 1, to_state_id: 2 },
    ]);

    expect(result).toEqual({ workflowId: 1, count: 2 });
    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  it("rolls back and rethrows if an insert fails", async () => {
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // DELETE
        .mockRejectedValueOnce(new Error("insert boom")), // first INSERT fails
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(client);

    await expect(
      saveTransitions(1, [{ from_state_id: null, to_state_id: 1 }])
    ).rejects.toThrow("insert boom");

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});
