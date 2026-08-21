import { Pool, QueryResult, QueryArrayResult } from 'pg';
import { logger } from '../utils/logger';

const connectionString = process.env.DATABASE_URL as string;
const isLocal = !connectionString || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  logger.db('New client connected to local PostgreSQL pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
});

// Wrapped query helper that automatically logs execution time & SQL statements
const originalQuery = pool.query.bind(pool);

pool.query = (async (text: any, params?: any, callback?: any): Promise<any> => {
  const start = Date.now();
  const queryStr = typeof text === 'string' ? text : text?.text;
  try {
    const res = await (originalQuery as any)(text, params, callback);
    const duration = Date.now() - start;
    logger.db(queryStr?.replace(/\s+/g, ' ').trim() || 'SQL Query', duration);
    return res;
  } catch (err: any) {
    const duration = Date.now() - start;
    logger.db(queryStr?.replace(/\s+/g, ' ').trim() || 'SQL Query', duration, err);
    throw err;
  }
}) as typeof pool.query;

export default pool;
