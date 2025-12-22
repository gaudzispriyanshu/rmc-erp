import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './config/db';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import { authenticate } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
