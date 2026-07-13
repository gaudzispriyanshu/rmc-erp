import { createCustomerSchema, updateCustomerSchema } from "../customerSchemas";
import { createDriverSchema } from "../driverSchemas";
import { createVehicleSchema } from "../vehicleSchemas";
import { recordStockMovementSchema, createInventoryItemSchema } from "../inventorySchemas";
import { setMixRequirementsSchema } from "../mixDesignSchemas";
import { createCubeTestSchema, createNonConformanceSchema } from "../qcSchemas";
import { createTripSchema, updateTripSchema } from "../tripSchemas";
import { createChallanSchema } from "../challanSchemas";
import { saveTransitionsSchema, createWorkflowSchema } from "../workflowSchemas";
import { saveRolePermissionsSchema } from "../roleSchemas";
import { registerSchema, loginSchema } from "../authSchemas";

describe("customerSchemas", () => {
  it("requires name on create", () => {
    expect(createCustomerSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(createCustomerSchema.safeParse({ name: "ACME" }).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(createCustomerSchema.safeParse({ name: "ACME", email: "nope" }).success).toBe(false);
  });

  it("rejects an empty update", () => {
    expect(updateCustomerSchema.safeParse({}).success).toBe(false);
  });

  it("validates and uppercases GST numbers", () => {
    const result = createCustomerSchema.safeParse({ name: "ACME", gst_number: "22aaaaa0000a1z5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gst_number).toBe("22AAAAA0000A1Z5");
    }
    expect(createCustomerSchema.safeParse({ name: "ACME", gst_number: "NOT-A-GSTIN" }).success).toBe(false);
  });
});

describe("driver & vehicle schemas", () => {
  it("rejects a negative base_salary", () => {
    expect(createDriverSchema.safeParse({ name: "Ram", base_salary: -100 }).success).toBe(false);
  });

  it("rejects a negative vehicle capacity", () => {
    expect(createVehicleSchema.safeParse({ plate_number: "HP01A1234", capacity: -6 }).success).toBe(false);
  });
});

describe("inventorySchemas", () => {
  it("allows negative change_qty (stock out) but not zero", () => {
    const base = { inventory_item_id: 1 };
    expect(recordStockMovementSchema.safeParse({ ...base, change_qty: -50 }).success).toBe(true);
    expect(recordStockMovementSchema.safeParse({ ...base, change_qty: 50 }).success).toBe(true);
    expect(recordStockMovementSchema.safeParse({ ...base, change_qty: 0 }).success).toBe(false);
  });

  it("rejects negative current_stock on item create", () => {
    expect(createInventoryItemSchema.safeParse({ name: "Cement", current_stock: -1 }).success).toBe(false);
  });
});

describe("mixDesignSchemas", () => {
  it("rejects a non-array requirements payload and zero quantities", () => {
    expect(setMixRequirementsSchema.safeParse({ requirements: "cement" }).success).toBe(false);
    expect(
      setMixRequirementsSchema.safeParse({
        requirements: [{ inventory_item_id: 1, quantity_per_m3: 0 }],
      }).success
    ).toBe(false);
    expect(
      setMixRequirementsSchema.safeParse({
        requirements: [{ inventory_item_id: 1, quantity_per_m3: 350 }],
      }).success
    ).toBe(true);
  });
});

describe("qcSchemas", () => {
  it("rejects a negative compressive_strength", () => {
    expect(createCubeTestSchema.safeParse({ compressive_strength: -30 }).success).toBe(false);
  });

  it("requires description and strips reported_by (set from req.user, not the client)", () => {
    expect(createNonConformanceSchema.safeParse({ severity: "major" }).success).toBe(false);
    const result = createNonConformanceSchema.safeParse({ description: "Weak batch", reported_by: 999 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("reported_by");
    }
  });
});

describe("tripSchemas", () => {
  const validTrip = { order_id: 1, vehicle_id: 2, driver_id: 3, eta: "2026-08-01T10:30" };

  it("accepts a valid create and coerces eta to a Date", () => {
    const result = createTripSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eta).toBeInstanceOf(Date);
    }
  });

  it("rejects a missing vehicle_id and an unparseable eta", () => {
    const { vehicle_id, ...rest } = validTrip;
    expect(createTripSchema.safeParse(rest).success).toBe(false);
    expect(createTripSchema.safeParse({ ...validTrip, eta: "not-a-date" }).success).toBe(false);
  });

  it("rejects a negative volume_delivered on update", () => {
    expect(updateTripSchema.safeParse({ volume_delivered: -3 }).success).toBe(false);
  });
});

describe("challanSchemas", () => {
  it("rejects a zero-quantity challan", () => {
    expect(createChallanSchema.safeParse({ trip_id: 1, quantity: 0 }).success).toBe(false);
  });
});

describe("workflowSchemas", () => {
  it("requires name and entity_type on create", () => {
    expect(createWorkflowSchema.safeParse({ name: "Order flow" }).success).toBe(false);
    expect(createWorkflowSchema.safeParse({ name: "Order flow", entity_type: "order" }).success).toBe(true);
  });

  it("allows null from_state_id (initial transition) but not null to_state_id", () => {
    expect(
      saveTransitionsSchema.safeParse({ transitions: [{ from_state_id: null, to_state_id: 2 }] }).success
    ).toBe(true);
    expect(
      saveTransitionsSchema.safeParse({ transitions: [{ from_state_id: 1, to_state_id: null }] }).success
    ).toBe(false);
  });
});

describe("roleSchemas", () => {
  it("rejects non-integer permission ids", () => {
    expect(saveRolePermissionsSchema.safeParse({ permissionIds: [1, "2"] }).success).toBe(false);
    expect(saveRolePermissionsSchema.safeParse({ permissionIds: [] }).success).toBe(true);
  });
});

describe("authSchemas", () => {
  it("enforces the password policy on register only", () => {
    const base = { email: "new@x.com", name: "New", role_id: 1 };
    expect(registerSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "long-enough-pass" }).success).toBe(true);
    // login must not lock out existing accounts with short passwords
    expect(loginSchema.safeParse({ email: "old@x.com", password: "abc" }).success).toBe(true);
  });

  it("rejects passwords beyond bcrypt's 72-byte limit", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x".repeat(73) }).success).toBe(false);
  });
});
