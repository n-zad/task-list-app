import { toTask } from './index.js';

function now() {
  return new Date().toISOString();
}

export function listTasks(db, { status } = {}) {
  let sql = 'SELECT * FROM tasks';

  if (status === 'active') {
    sql += ' WHERE completed = 0';
  } else if (status === 'completed') {
    sql += ' WHERE completed = 1';
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all();
  return rows.map(toTask);
}

export function getTaskById(db, id) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return row ? toTask(row) : null;
}

export function createTask(db, title) {
  const timestamp = now();
  const result = db
    .prepare(
      `INSERT INTO tasks (title, completed, created_at, updated_at)
       VALUES (?, 0, ?, ?)`,
    )
    .run(title, timestamp, timestamp);

  return getTaskById(db, result.lastInsertRowid);
}

export function updateTask(db, id, { title, completed }) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!existing) {
    return null;
  }

  const nextTitle = title !== undefined ? title : existing.title;
  const nextCompleted =
    completed !== undefined ? (completed ? 1 : 0) : existing.completed;

  db.prepare(
    `UPDATE tasks
     SET title = ?, completed = ?, updated_at = ?
     WHERE id = ?`,
  ).run(nextTitle, nextCompleted, now(), id);

  return getTaskById(db, id);
}

export function deleteTask(db, id) {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function deleteCompletedTasks(db) {
  const result = db.prepare('DELETE FROM tasks WHERE completed = 1').run();
  return result.changes;
}

export function countActiveTasks(db) {
  const row = db
    .prepare('SELECT COUNT(*) AS count FROM tasks WHERE completed = 0')
    .get();
  return row.count;
}
