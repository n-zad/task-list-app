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

  sql += ' ORDER BY position ASC, id ASC';

  const rows = db.prepare(sql).all();
  return rows.map(toTask);
}

export function getTaskById(db, id) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return row ? toTask(row) : null;
}

export function createTask(db, title) {
  const timestamp = now();

  const insert = db.transaction(() => {
    db.prepare(
      'UPDATE tasks SET position = position + 1, updated_at = ?',
    ).run(timestamp);

    const result = db
      .prepare(
        `INSERT INTO tasks (title, completed, position, created_at, updated_at)
         VALUES (?, 0, 0, ?, ?)`,
      )
      .run(title, timestamp, timestamp);

    return result.lastInsertRowid;
  });

  return getTaskById(db, insert());
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

export function reorderTasks(db, orderedIds) {
  const existing = db.prepare('SELECT id FROM tasks ORDER BY position ASC, id ASC').all();
  const existingIds = existing.map((row) => row.id);

  if (orderedIds.length !== existingIds.length) {
    throw new Error('order must include every task');
  }

  const existingSet = new Set(existingIds);

  for (const id of orderedIds) {
    if (!existingSet.has(id)) {
      throw new Error('order contains unknown task id');
    }
  }

  const timestamp = now();
  const update = db.prepare(
    'UPDATE tasks SET position = ?, updated_at = ? WHERE id = ?',
  );

  const applyOrder = db.transaction((ids) => {
    ids.forEach((id, index) => update.run(index, timestamp, id));
  });

  applyOrder(orderedIds);

  return listTasks(db);
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
