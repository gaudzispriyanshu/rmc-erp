
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, JwtPayload } from './auth';

// Mock dependencies
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

describe('Auth Middleware RBAC Refactor', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should attach roleId to req.user when authenticating', () => {
    const payload: JwtPayload = {
      userId: 1,
      email: 'test@example.com',
      roleId: 2, // Using roleId as per new requirement
    };
    const token = jwt.sign(payload, JWT_SECRET);

    (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    // We expect req.user to have roleId.
    // Types might complain until we fix global.d.ts, but at runtime this should work if auth.ts is correct.
    const user = (mockRequest as any).user;
    expect(user).toBeDefined();
    expect(user.roleId).toBe(2);
    expect(user.userId).toBe(1);
  });
});
