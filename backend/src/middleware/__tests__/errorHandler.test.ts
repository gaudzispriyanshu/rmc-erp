import { Request, Response } from "express";
import { errorHandler } from "../errorHandler";
import { AppError } from "../../errors/AppError";

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const req = { method: "POST", originalUrl: "/api/orders" } as Request;
const next = jest.fn();

// Silence the expected console.error from the 500 case.
beforeAll(() => jest.spyOn(console, "error").mockImplementation(() => {}));
afterAll(() => (console.error as jest.Mock).mockRestore());

describe("errorHandler", () => {
  it("uses an AppError's status and message", () => {
    const res = mockRes();
    errorHandler(new AppError(404, "Order not found"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Order not found" });
  });

  it("translates a foreign key violation to 400", () => {
    const res = mockRes();
    errorHandler({ code: "23503", message: "insert violates FK constraint orders_customer_id_fkey" }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "A referenced record does not exist." });
  });

  it("translates an invalid-type error to 400", () => {
    const res = mockRes();
    errorHandler({ code: "22P02", message: 'invalid input syntax for type integer: "abc"' }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.json as jest.Mock).mock.calls[0][0].error).toMatch(/invalid value/i);
  });

  it("maps a known unique constraint to a friendly 409", () => {
    const res = mockRes();
    errorHandler({ code: "23505", constraint: "customers_gst_number_key" }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "A customer with this GST number already exists." });
  });

  it("falls back to a generic 409 for an unknown unique constraint", () => {
    const res = mockRes();
    errorHandler({ code: "23505", constraint: "some_other_key" }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "A record with these details already exists." });
  });

  it("hides an unknown error behind a generic 500 (no raw text leaked)", () => {
    const res = mockRes();
    errorHandler(new Error("column xyz does not exist"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error." });
    const sent = JSON.stringify((res.json as jest.Mock).mock.calls[0][0]);
    expect(sent).not.toMatch(/column xyz/);
  });
});
