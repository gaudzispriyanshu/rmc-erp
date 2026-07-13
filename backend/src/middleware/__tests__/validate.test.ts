import { z } from "zod";
import { Request, Response } from "express";
import { validate } from "../validate";

const bodySchema = z.object({ quantity: z.number().positive() });
const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = (overrides: Partial<Request> = {}) =>
  ({ body: {}, params: {}, query: {}, ...overrides } as Request);

describe("validate middleware", () => {
  it("calls next() and replaces req.body with parsed data on valid input", () => {
    const req = mockReq({ body: { quantity: 5, unknown_field: "x" } });
    const res = mockRes();
    const next = jest.fn();

    validate({ body: bodySchema })(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    // Unknown keys stripped — services only ever see whitelisted fields.
    expect(req.body).toEqual({ quantity: 5 });
  });

  it("returns 400 with error string and details array on invalid body", () => {
    const req = mockReq({ body: { quantity: -5 } });
    const res = mockRes();
    const next = jest.fn();

    validate({ body: bodySchema })(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(typeof payload.error).toBe("string");
    expect(payload.details).toEqual([
      expect.objectContaining({ field: "quantity", message: expect.any(String) }),
    ]);
  });

  it("checks params before body", () => {
    const req = mockReq({ params: { id: "abc" }, body: { quantity: -5 } } as any);
    const res = mockRes();
    const next = jest.fn();

    validate({ params: paramsSchema, body: bodySchema })(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.details[0].field).toBe("id");
  });

  it("passes through when no schemas are given", () => {
    const req = mockReq({ body: { anything: true } });
    const res = mockRes();
    const next = jest.fn();

    validate({})(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ anything: true });
  });
});
