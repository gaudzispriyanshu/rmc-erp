import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './config/db';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import roleRoutes from './routes/roles';
import tripRoutes from './routes/trips';
import customerRoutes from './routes/customers';
import driverRoutes from './routes/drivers';
import vehicleRoutes from './routes/vehicles';
import inventoryRoutes from './routes/inventory';
import mixDesignRoutes from './routes/mixDesigns';
import workflowRoutes from './routes/workflows';
import dispatchRoutes from './routes/dispatch';
import qualityRoutes from './routes/quality';
import { authenticate } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/mix-designs', mixDesignRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/quality', qualityRoutes);

// Protected route example
// We extend Request type for `user` in a declaration file (see instructions below).
app.get('/api/protected', authenticate, (req: Request, res: Response) => {
  // req.user will be available if middleware sets it
  // use (req as any).user if you haven't added the declaration merging file yet
  res.json({ message: 'This is protected data!', user: (req as any).user });
});

// Test route
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'API is working!', time: result.rows[0] });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
