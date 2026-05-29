import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

function migrate(dbConnection) {
  const columns = dbConnection.prepare('PRAGMA table_info(tasks)').all();
  const hasPosition = columns.some((column) => column.name === 'position');

  if (hasPosition) {
    return;
  }

  dbConnection.exec(
    'ALTER TABLE tasks ADD COLUMN position INTEGER NOT NULL DEFAULT 0',
  );

  const rows = dbConnection
    .prepare('SELECT id FROM tasks ORDER BY created_at DESC, id DESC')
    .all();
  const update = dbConnection.prepare(
    'UPDATE tasks SET position = ? WHERE id = ?',
  );
  const backfill = dbConnection.transaction((items) => {
    items.forEach((row, index) => update.run(index, row.id));
  });

  backfill(rows);
}

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
  migrate(connection);

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

export function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
