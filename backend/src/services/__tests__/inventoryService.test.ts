jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn(), connect: jest.fn() },
}));

import pool from "../../config/db";
import { consumeStockForOrder } from "../inventoryService";

const mockPool = pool as unknown as { query: jest.Mock; connect: jest.Mock };

beforeEach(() => mockPool.connect.mockReset());

describe("consumeStockForOrder", () => {
  it("deducts quantity_per_m3 * order.quantity for each material", async () => {
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, mix_design_id: 5, quantity: 10 }] }) // SELECT order
        .mockResolvedValueOnce({ rows: [ // SELECT requirements
          { inventory_item_id: 1, quantity_per_m3: 320, name: "Cement" },
          { inventory_item_id: 2, quantity_per_m3: 160, name: "Water" },
        ] })
        .mockResolvedValueOnce({ rows: [{ id: 11 }] }) // INSERT movement (cement)
        .mockResolvedValueOnce({})                     // UPDATE stock (cement)
        .mockResolvedValueOnce({ rows: [{ id: 12 }] }) // INSERT movement (water)
        .mockResolvedValueOnce({})                     // UPDATE stock (water)
        .mockResolvedValueOnce({}),                    // COMMIT
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(client);

    const result = await consumeStockForOrder(1);

    expect(result.orderId).toBe(1);
    expect(result.movements).toHaveLength(2);

    // Cement: 320 * 10 = 3200 consumed => change_qty -3200
    const cementInsert = client.query.mock.calls.find(
      (c: any[]) => typeof c[0] === "string" && c[0].includes("INSERT INTO stock_movements") && c[1]?.[0] === 1
    );
    expect(cementInsert[1][1]).toBe(-3200);

    // Water: 160 * 10 = 1600 consumed => change_qty -1600
    const waterInsert = client.query.mock.calls.find(
      (c: any[]) => typeof c[0] === "string" && c[0].includes("INSERT INTO stock_movements") && c[1]?.[0] === 2
    );
    expect(waterInsert[1][1]).toBe(-1600);

    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  it("rolls back if the order has no mix design", async () => {
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, mix_design_id: null, quantity: 10 }] }), // SELECT order
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(client);

    await expect(consumeStockForOrder(1)).rejects.toThrow("no mix design");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});
