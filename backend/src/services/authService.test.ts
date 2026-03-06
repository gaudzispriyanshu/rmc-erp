import { registerUser, loginUser, verifyUser } from './authService';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with role_id from role name', async () => {
      // Mock user check (does not exist)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      // Mock role check (exists)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock insert
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com', role_id: 1, name: 'Test User' }] });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await registerUser('test@example.com', 'password', 'Test User', 'admin');

      expect(pool.query).toHaveBeenCalledTimes(3);
      // Check that role was looked up
      expect(pool.query).toHaveBeenNthCalledWith(2, 'SELECT id FROM roles WHERE name = $1', ['admin']);
      // Check insert does NOT contain role string column
      expect(pool.query).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO users'), expect.arrayContaining(['test@example.com', 'hashed_password', 'Test User', 1]));

      expect(result.user.role).toBe('admin');
      expect(result.token).toBe('mock_token');
    });
  });

  describe('loginUser', () => {
    it('should login user and return role name from joined table', async () => {
      // Mock select user
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role_id: 1,
        role_name: 'admin' // joined value
      };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await loginUser('test@example.com', 'password');

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN roles'), ['test@example.com']);
      expect(result.user.role).toBe('admin');
    });

    it('should fallback to legacy role column if role_id is missing', async () => {
      // Mock select user (legacy, no role_id, no role_name from join)
      const mockUser = {
        id: 1,
        email: 'old@example.com',
        password: 'hashed_password',
        name: 'Old User',
        role_id: null,
        role_name: null,
        role: 'staff' // legacy column
      };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock role lookup for fallback
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 2, name: 'staff' }] });
      // Mock update user
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await loginUser('old@example.com', 'password');

      // 1. Select user
      expect(pool.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT u.*'), ['old@example.com']);
      // 2. Lookup role (fallback)
      expect(pool.query).toHaveBeenNthCalledWith(2, 'SELECT id, name FROM roles WHERE name = $1', ['staff']);
      // 3. Update user
      expect(pool.query).toHaveBeenNthCalledWith(3, expect.stringContaining('UPDATE users SET role_id = $1'), [2, 1]);

      expect(result.user.role).toBe('staff');
      expect(result.user.roleId).toBe(2);
    });
  });

  describe('verifyUser', () => {
    it('should return user with role name from join', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role_id: 1,
        role_name: 'admin',
        legacy_role: null
      };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await verifyUser(1);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN roles'), [1]);
      expect(result.role).toBe('admin');
    });

    it('should fallback to legacy role column if role_id is missing', async () => {
      const mockUser = {
        id: 1,
        email: 'legacy@example.com',
        name: 'Legacy User',
        role_id: null,
        role_name: null,
        legacy_role: 'staff'
      };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await verifyUser(1);

      expect(result.role).toBe('staff');
    });
  });
});
