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
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);


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
app.get('/api/protected', authenticate, (req: Request, res: Response) => {
  res.json({ message: 'This is protected data!', user: (req as any).user });
});

// Test route
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'API is working!', time: result.rows[0] });
  } catch (err: any) {
    logger.error('Error in /api/test endpoint', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Terminal error handler — must be mounted after all routes.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
