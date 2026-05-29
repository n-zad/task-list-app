import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { closeDb, getDb, initDb, toTask } from '../db/index.js';
import {
  countActiveTasks,
  createTask,
  deleteCompletedTasks,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from '../db/tasks.js';

const testDbPath = path.join(
  os.tmpdir(),
  `task-list-db-test-${process.pid}.sqlite`,
);

function removeTestDb() {
  closeDb();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}

before(() => {
  process.env.NODE_ENV = 'test';
  process.env.DB_PATH = testDbPath;
});

after(() => {
  removeTestDb();
  delete process.env.DB_PATH;
});

beforeEach(() => {
  removeTestDb();
  initDb(testDbPath);
});

describe('database initialization', () => {
  it('creates the tasks table', () => {
    const db = getDb();
    const table = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'",
      )
      .get();

    assert.equal(table.name, 'tasks');
  });

  it('reuses a singleton connection from getDb', () => {
    assert.equal(getDb(), getDb());
  });
});

describe('toTask', () => {
  it('maps SQLite rows to API task objects', () => {
    const task = toTask({
      id: 1,
      title: 'Write tests',
      completed: 0,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    });

    assert.deepEqual(task, {
      id: 1,
      title: 'Write tests',
      completed: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('converts completed flag 1 to true', () => {
    const task = toTask({
      id: 2,
      title: 'Done',
      completed: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    assert.equal(task.completed, true);
  });
});

describe('task repository', () => {
  it('returns an empty list when no tasks exist', () => {
    assert.deepEqual(listTasks(getDb()), []);
  });

  it('creates and retrieves a task', () => {
    const created = createTask(getDb(), 'Finish assignment');

    assert.equal(created.title, 'Finish assignment');
    assert.equal(created.completed, false);
    assert.ok(created.createdAt);
    assert.equal(created.createdAt, created.updatedAt);

    const fetched = getTaskById(getDb(), created.id);
    assert.deepEqual(fetched, created);
  });

  it('lists tasks newest first', () => {
    const db = getDb();
    createTask(db, 'First');
    createTask(db, 'Second');

    const titles = listTasks(db).map((task) => task.title);
    assert.deepEqual(titles, ['Second', 'First']);
  });

  it('updates title and completed state', () => {
    const db = getDb();
    const created = createTask(db, 'Original');

    const updated = updateTask(db, created.id, {
      title: 'Updated',
      completed: true,
    });

    assert.equal(updated.title, 'Updated');
    assert.equal(updated.completed, true);
    assert.notEqual(updated.updatedAt, created.updatedAt);
  });

  it('returns null when updating a missing task', () => {
    assert.equal(updateTask(getDb(), 999, { title: 'Nope' }), null);
  });

  it('deletes a task by id', () => {
    const db = getDb();
    const created = createTask(db, 'Temporary');

    assert.equal(deleteTask(db, created.id), true);
    assert.equal(getTaskById(db, created.id), null);
  });

  it('returns false when deleting a missing task', () => {
    assert.equal(deleteTask(getDb(), 404), false);
  });

  it('filters active and completed tasks', () => {
    const db = getDb();
    const active = createTask(db, 'Active');
    const done = createTask(db, 'Done');
    updateTask(db, done.id, { completed: true });

    assert.deepEqual(
      listTasks(db, { status: 'active' }).map((task) => task.id),
      [active.id],
    );
    assert.deepEqual(
      listTasks(db, { status: 'completed' }).map((task) => task.id),
      [done.id],
    );
  });

  it('deletes only completed tasks', () => {
    const db = getDb();
    const active = createTask(db, 'Keep');
    const done = createTask(db, 'Remove');
    updateTask(db, done.id, { completed: true });

    assert.equal(deleteCompletedTasks(db), 1);
    assert.deepEqual(listTasks(db).map((task) => task.id), [active.id]);
  });

  it('counts only incomplete tasks', () => {
    const db = getDb();
    createTask(db, 'One');
    const two = createTask(db, 'Two');
    updateTask(db, two.id, { completed: true });

    assert.equal(countActiveTasks(db), 1);
  });
});
