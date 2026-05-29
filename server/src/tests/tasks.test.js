import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { closeDb, initDb } from '../db/index.js';
import app from '../app.js';

const testDbPath = path.join(
  os.tmpdir(),
  `task-list-api-test-${process.pid}.sqlite`,
);

function resetDatabase() {
  closeDb();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  initDb(testDbPath);
}

before(() => {
  process.env.NODE_ENV = 'test';
  process.env.DB_PATH = testDbPath;
});

after(() => {
  resetDatabase();
  delete process.env.DB_PATH;
});

beforeEach(() => {
  resetDatabase();
});

describe('GET /api/tasks', () => {
  it('returns an empty list initially', async () => {
    const response = await request(app).get('/api/tasks');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, []);
  });

  it('returns created tasks', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'First task' });

    const response = await request(app).get('/api/tasks');

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].title, 'First task');
    assert.equal(response.body[0].completed, false);
  });

  it('filters by active and completed status', async () => {
    const active = await request(app)
      .post('/api/tasks')
      .send({ title: 'Active' });
    const completed = await request(app)
      .post('/api/tasks')
      .send({ title: 'Done' });

    await request(app)
      .patch(`/api/tasks/${completed.body.id}`)
      .send({ completed: true });

    const activeResponse = await request(app).get('/api/tasks?status=active');
    const completedResponse = await request(app).get('/api/tasks?status=completed');

    assert.deepEqual(
      activeResponse.body.map((task) => task.id),
      [active.body.id],
    );
    assert.deepEqual(
      completedResponse.body.map((task) => task.id),
      [completed.body.id],
    );
  });

  it('rejects invalid status query values', async () => {
    const response = await request(app).get('/api/tasks?status=invalid');

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'status must be "active" or "completed"');
  });
});

describe('POST /api/tasks', () => {
  it('creates a task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: '  Finish assignment  ' });

    assert.equal(response.status, 201);
    assert.equal(response.body.title, 'Finish assignment');
    assert.equal(response.body.completed, false);
    assert.ok(response.body.id);
  });

  it('rejects empty titles', async () => {
    const response = await request(app).post('/api/tasks').send({ title: '   ' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Task title is required');
  });

  it('rejects missing titles', async () => {
    const response = await request(app).post('/api/tasks').send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Task title is required');
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates title and toggles completed', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Original' });

    const titleResponse = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: 'Updated' });

    const completedResponse = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ completed: true });

    assert.equal(titleResponse.status, 200);
    assert.equal(titleResponse.body.title, 'Updated');

    assert.equal(completedResponse.status, 200);
    assert.equal(completedResponse.body.completed, true);
  });

  it('returns 404 for a missing task', async () => {
    const response = await request(app)
      .patch('/api/tasks/999')
      .send({ title: 'Missing' });

    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Task not found');
  });

  it('rejects empty edited titles', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Keep me' });

    const response = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: '  ' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Task title is required');
  });

  it('rejects invalid request bodies', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Keep me' });

    const response = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ completed: 'yes' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'completed must be a boolean');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Delete me' });

    const deleteResponse = await request(app).delete(
      `/api/tasks/${created.body.id}`,
    );
    const listResponse = await request(app).get('/api/tasks');

    assert.equal(deleteResponse.status, 204);
    assert.deepEqual(listResponse.body, []);
  });

  it('returns 404 for a missing task', async () => {
    const response = await request(app).delete('/api/tasks/999');

    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Task not found');
  });
});

describe('PUT /api/tasks/reorder', () => {
  it('reorders tasks and returns the updated list', async () => {
    const first = await request(app)
      .post('/api/tasks')
      .send({ title: 'First' });
    const second = await request(app)
      .post('/api/tasks')
      .send({ title: 'Second' });
    const third = await request(app)
      .post('/api/tasks')
      .send({ title: 'Third' });

    const response = await request(app)
      .put('/api/tasks/reorder')
      .send({ order: [first.body.id, third.body.id, second.body.id] });

    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.map((task) => task.title),
      ['First', 'Third', 'Second'],
    );
  });

  it('rejects incomplete order arrays', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Only one' });

    const response = await request(app)
      .put('/api/tasks/reorder')
      .send({ order: [created.body.id, 999] });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'order must include every task');
  });

  it('rejects invalid order payloads', async () => {
    const response = await request(app)
      .put('/api/tasks/reorder')
      .send({ order: 'not-an-array' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'order must be an array of task ids');
  });
});

describe('DELETE /api/tasks/completed', () => {
  it('deletes only completed tasks', async () => {
    const active = await request(app)
      .post('/api/tasks')
      .send({ title: 'Active' });
    const completed = await request(app)
      .post('/api/tasks')
      .send({ title: 'Done' });

    await request(app)
      .patch(`/api/tasks/${completed.body.id}`)
      .send({ completed: true });

    const response = await request(app).delete('/api/tasks/completed');
    const listResponse = await request(app).get('/api/tasks');

    assert.equal(response.status, 200);
    assert.equal(response.body.deleted, 1);
    assert.deepEqual(
      listResponse.body.map((task) => task.id),
      [active.body.id],
    );
  });
});
