import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

/**
 * Database connection and initialization.
 *
 * - Use server/data/dev.sqlite for development
 * - Use server/data/test.sqlite for tests (NODE_ENV=test or DB_PATH)
 * - Executes schema.sql to create the tasks table if missing
 */
export function getDbPath() {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }

  const isTest = process.env.NODE_ENV === 'test';
  const filename = isTest ? 'test.sqlite' : 'dev.sqlite';
  return path.join(__dirname, '../../data', filename);
}

export function initDb(dbPath = getDbPath()) {
  closeDb();

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const connection = new Database(dbPath);
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  connection.exec(schema);

  db = connection;
  return db;
}

export function getDb() {
  if (!db) {
    initDb();
  }

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
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
