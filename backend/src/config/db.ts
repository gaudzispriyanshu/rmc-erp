import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export default pool;
