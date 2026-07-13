import {
  createOrderSchema,
  updateOrderSchema,
  changeOrderStatusSchema,
  listOrdersQuerySchema,
} from "../orderSchemas";
import { idParamSchema } from "../common";

const validCreate = {
  customer_id: 1,
  mix_design_id: 2,
  quantity: 25.5,
  delivery_address: "Plot 14, Industrial Area",
  delivery_date: "2026-08-01",
};

describe("createOrderSchema", () => {
  it("accepts a valid payload", () => {
    expect(createOrderSchema.safeParse(validCreate).success).toBe(true);
  });

  it("accepts a payload without the optional fields", () => {
    const { customer_id, delivery_address, ...rest } = validCreate;
    expect(createOrderSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects a missing mix_design_id", () => {
    const { mix_design_id, ...rest } = validCreate;
    expect(createOrderSchema.safeParse(rest).success).toBe(false);
  });

  it.each([0, -5])("rejects quantity %p", (quantity) => {
    expect(createOrderSchema.safeParse({ ...validCreate, quantity }).success).toBe(false);
  });

  it("rejects a string quantity", () => {
    expect(createOrderSchema.safeParse({ ...validCreate, quantity: "10" }).success).toBe(false);
  });

  it("rejects a quantity above the cap", () => {
    expect(createOrderSchema.safeParse({ ...validCreate, quantity: 10_001 }).success).toBe(false);
  });

  it("rejects an oversized delivery_address", () => {
    const payload = { ...validCreate, delivery_address: "x".repeat(501) };
    expect(createOrderSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects a malformed delivery_date", () => {
    expect(createOrderSchema.safeParse({ ...validCreate, delivery_date: "01-08-2026" }).success).toBe(false);
  });
});

describe("updateOrderSchema", () => {
  it("accepts a single-field update", () => {
    expect(updateOrderSchema.safeParse({ quantity: 10 }).success).toBe(true);
  });

  it("rejects an empty body", () => {
    const result = updateOrderSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("No fields to update provided.");
    }
  });

  it("rejects a body containing only unknown keys", () => {
    expect(updateOrderSchema.safeParse({ hacker: true }).success).toBe(false);
  });

  it("strips unknown keys from a valid update (mass-assignment guard)", () => {
    const result = updateOrderSchema.safeParse({ quantity: 10, is_admin: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ quantity: 10 });
    }
  });

  it("rejects a negative quantity", () => {
    expect(updateOrderSchema.safeParse({ quantity: -1 }).success).toBe(false);
  });
});

describe("changeOrderStatusSchema", () => {
  it("accepts a positive integer workflow_state_id", () => {
    expect(changeOrderStatusSchema.safeParse({ workflow_state_id: 3 }).success).toBe(true);
  });

  it.each([undefined, 0, -1, "3"])("rejects workflow_state_id %p", (workflow_state_id) => {
    expect(changeOrderStatusSchema.safeParse({ workflow_state_id }).success).toBe(false);
  });
});

describe("listOrdersQuerySchema", () => {
  it("accepts an empty query", () => {
    expect(listOrdersQuerySchema.safeParse({}).success).toBe(true);
  });

  it("coerces numeric strings from the query string", () => {
    const result = listOrdersQuerySchema.safeParse({ start: "0", end: "9", mix_type_id: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ start: 0, end: 9, mix_type_id: 1 });
    }
  });

  it("rejects a negative start", () => {
    expect(listOrdersQuerySchema.safeParse({ start: "-1" }).success).toBe(false);
  });

  it("rejects a malformed date filter", () => {
    expect(listOrdersQuerySchema.safeParse({ date_from: "not-a-date" }).success).toBe(false);
  });
});

describe("idParamSchema", () => {
  it("coerces a numeric string id", () => {
    const result = idParamSchema.safeParse({ id: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it.each(["abc", "-1", "1.5", "0"])("rejects id %p", (id) => {
    expect(idParamSchema.safeParse({ id }).success).toBe(false);
  });
});
