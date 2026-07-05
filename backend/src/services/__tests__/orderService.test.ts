jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn(), connect: jest.fn() },
}));

import pool from "../../config/db";
import { changeOrderStatus } from "../orderService";

const mockPool = pool as unknown as { query: jest.Mock; connect: jest.Mock };

beforeEach(() => mockPool.query.mockReset());

describe("changeOrderStatus", () => {
  it("throws NOT_FOUND when the order does not exist", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] }); // SELECT current state
    await expect(changeOrderStatus(999, 2)).rejects.toThrow("NOT_FOUND");
  });

  it("throws ILLEGAL_TRANSITION when the move is not defined", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ workflow_state_id: 1 }] }) // current state
      .mockResolvedValueOnce({ rows: [] }); // isTransitionAllowed -> none
    await expect(changeOrderStatus(1, 9)).rejects.toThrow("ILLEGAL_TRANSITION");
  });

  it("updates the order when the transition is allowed", async () => {
    const updatedRow = { id: 1, workflow_state_id: 2, status: "confirmed" };
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ workflow_state_id: 1 }] }) // current state
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })        // isTransitionAllowed -> yes
      .mockResolvedValueOnce({ rows: [{ id: 2, slug: "confirmed" }] }) // getStateById
      .mockResolvedValueOnce({ rows: [updatedRow] });              // UPDATE
    await expect(changeOrderStatus(1, 2)).resolves.toEqual(updatedRow);
  });
});
