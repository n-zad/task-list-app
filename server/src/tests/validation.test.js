import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTitle,
  parseReorderBody,
  parseStatusQuery,
  parseTaskId,
  parseTaskUpdates,
} from '../routes/validation.js';

describe('route validation helpers', () => {
  it('parses positive integer task ids', () => {
    assert.equal(parseTaskId('1'), 1);
    assert.equal(parseTaskId('invalid'), null);
    assert.equal(parseTaskId('-1'), null);
  });

  it('normalizes titles by trimming whitespace', () => {
    assert.equal(normalizeTitle('  hello  '), 'hello');
    assert.equal(normalizeTitle('   '), null);
    assert.equal(normalizeTitle(123), null);
  });

  it('validates status query values', () => {
    assert.deepEqual(parseStatusQuery(undefined), { status: undefined });
    assert.deepEqual(parseStatusQuery('active'), { status: 'active' });
    assert.equal(parseStatusQuery('all').error, 'status must be "active" or "completed"');
  });

  it('parses patch updates', () => {
    assert.deepEqual(parseTaskUpdates({ title: 'Updated', completed: true }), {
      updates: { title: 'Updated', completed: true },
    });
    assert.equal(parseTaskUpdates({}).error, 'No valid fields to update');
    assert.equal(parseTaskUpdates({ title: ' ' }).error, 'Task title is required');
    assert.equal(parseTaskUpdates(null).error, 'Invalid request body');
    assert.equal(parseTaskUpdates([]).error, 'Invalid request body');
  });

  it('parses reorder payloads', () => {
    assert.deepEqual(parseReorderBody({ order: [3, 1, 2] }), { order: [3, 1, 2] });
    assert.equal(parseReorderBody({ order: [1, 1] }).error, 'order must not contain duplicate ids');
    assert.equal(parseReorderBody(null).error, 'Invalid request body');
    assert.equal(
      parseReorderBody({ order: [1.5] }).error,
      'order must contain valid task ids',
    );
  });
});
