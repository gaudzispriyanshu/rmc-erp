jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from "../../config/db";
import {
  hasPermissionForLookup,
  getLookupByEntity,
  getPermissionsForEntity,
  checkBatchPermissions,
} from "../lookupService";

const mockPool = pool as unknown as { query: jest.Mock };

beforeEach(() => {
  mockPool.query.mockReset();
});

describe("Lookup Service Config Engine Tests", () => {
  describe("hasPermissionForLookup", () => {
    it("grants access if user action slugs match allowed permission mapping in config", () => {
      expect(hasPermissionForLookup(["orders:read"], "orders")).toBe(true);
      expect(hasPermissionForLookup(["dispatch:write"], "vehicles")).toBe(true);
    });

    it("denies access if user lacks all required permission action slugs", () => {
      expect(hasPermissionForLookup(["roles:read"], "customers")).toBe(false);
      expect(hasPermissionForLookup(["quality:read"], "vehicles")).toBe(false);
    });
  });

  describe("getPermissionsForEntity", () => {
    it("returns permissions array from LOOKUP_CONFIG for known entities", () => {
      const perms = getPermissionsForEntity("customers");
      expect(perms).toContain("customers:read");
      expect(perms).toContain("orders:write");
    });

    it("returns empty array for unknown entities", () => {
      expect(getPermissionsForEntity("nonexistent")).toEqual([]);
    });
  });

  describe("checkBatchPermissions", () => {
    it("splits entities into allowed and forbidden based on user role slugs", async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ action_slug: "orders:read" }, { action_slug: "customers:read" }],
      });

      const result = await checkBatchPermissions(1, ["customers", "orders", "vehicles"]);
      expect(result.allowed).toContain("customers");
      expect(result.allowed).toContain("orders");
      expect(result.forbidden).toContain("vehicles");
    });
  });

  describe("getLookupByEntity Engine Queries", () => {
    it("dynamically queries customer lookup_fields", async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: "Acme Infra" },
          { id: 2, name: "L&T Construction" },
        ],
      });

      const result = await getLookupByEntity("customers");
      expect(result).toEqual([
        { id: 1, name: "Acme Infra" },
        { id: 2, name: "L&T Construction" },
      ]);
      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT id, name FROM customers ORDER BY name ASC",
        []
      );
    });

    it("dynamically queries orders lookup with customer_id filter", async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 10, status: "confirmed", customer_id: 1, mix_design_id: 2 }],
      });

      const result = await getLookupByEntity("orders", { customer_id: 1 });
      expect(result).toEqual([{ id: 10, status: "confirmed", customer_id: 1, mix_design_id: 2 }]);
      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT id, status, customer_id, mix_design_id FROM orders WHERE (status != 'CANCELLED') AND customer_id = $1 ORDER BY id DESC",
        [1]
      );
    });

    it("dynamically queries vehicles lookup with selected lookup_fields", async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 5, plate_number: "MH12-AB-1234", model: "Mixer 7m3" }],
      });

      const result = await getLookupByEntity("vehicles");
      expect(result).toEqual([{ id: 5, plate_number: "MH12-AB-1234", model: "Mixer 7m3" }]);
      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT id, plate_number, model FROM vehicles WHERE (status != 'out_of_service') ORDER BY plate_number ASC",
        []
      );
    });
  });
});
