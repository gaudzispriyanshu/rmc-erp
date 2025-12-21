import { updateOrder, getOrderById } from './orderService';
import pool from '../config/db';

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

describe('Order Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('should fetch order by id with joins', async () => {
      const mockOrder = {
        id: 1,
        customer_name: 'Test',
        concrete_grade: 'M20',
        status: 'pending'
      };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockOrder] });

      const result = await getOrderById(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN customers'),
        expect.anything()
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrder', () => {
    it('should update order fields dynamically', async () => {
      const mockUpdatedOrder = { id: 1, quantity: 150, status: 'delivered' };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUpdatedOrder] });

      const result = await updateOrder(1, { quantity: 150, status: 'delivered' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders'),
        expect.arrayContaining([150, 'delivered', 1])
      );
      // Check that the SQL contains the correct fields
      const queryCall = (pool.query as jest.Mock).mock.calls[0][0];
      expect(queryCall).toContain('quantity = $');
      expect(queryCall).toContain('status = $');
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should return null if no fields provided', async () => {
      const result = await updateOrder(1, {});
      expect(pool.query).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
