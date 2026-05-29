import path from 'node:path';
import { fileURLToPath } from 'node:url';
// TODO: Uncomment when wiring up SQLite persistence
// import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Database connection and initialization.
 *
 * - Use server/data/dev.sqlite for development
 * - Use server/data/test.sqlite for tests (set NODE_ENV=test or DB_PATH env var)
 * - Read and execute schema.sql to create the tasks table if missing
 */
export function getDbPath() {
  const isTest = process.env.NODE_ENV === 'test';
  const filename = isTest ? 'test.sqlite' : 'dev.sqlite';
  return process.env.DB_PATH || path.join(__dirname, '../../data', filename);
}

export function initDb() {
  // TODO: Open database, run schema.sql, return db instance
  //
  // const dbPath = getDbPath();
  // fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  // const db = new Database(dbPath);
  // const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  // db.exec(schema);
  // return db;

  throw new Error('initDb() not implemented yet');
}

export function getDb() {
  // TODO: Return a singleton database connection
  throw new Error('getDb() not implemented yet');
}

/**
 * Map a raw SQLite row to an API-friendly task object.
 * Convert completed (0/1) to boolean and expose ISO timestamps.
 */
export function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
