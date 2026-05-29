import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as tasksApi from '../api/tasksApi.js';

function mockResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe('tasksApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetches all tasks', async () => {
    fetch.mockResolvedValueOnce(mockResponse([{ id: 1, title: 'One' }]));

    const tasks = await tasksApi.getTasks();

    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
    expect(tasks).toEqual([{ id: 1, title: 'One' }]);
  });

  it('fetches tasks filtered by status', async () => {
    fetch.mockResolvedValueOnce(mockResponse([]));

    await tasksApi.getTasks('active');

    expect(fetch).toHaveBeenCalledWith('/api/tasks?status=active', expect.any(Object));
  });

  it('creates, updates, reorders, and deletes tasks', async () => {
    fetch
      .mockResolvedValueOnce(mockResponse({ id: 1, title: 'New' }))
      .mockResolvedValueOnce(mockResponse({ id: 1, title: 'Updated', completed: true }))
      .mockResolvedValueOnce(mockResponse([{ id: 1, title: 'Updated', completed: true }]))
      .mockResolvedValueOnce(mockResponse(null, { status: 204 }))
      .mockResolvedValueOnce(mockResponse({ deleted: 2 }));

    await expect(tasksApi.createTask('New')).resolves.toEqual({ id: 1, title: 'New' });
    await expect(
      tasksApi.updateTask(1, { title: 'Updated', completed: true }),
    ).resolves.toEqual({ id: 1, title: 'Updated', completed: true });
    await expect(tasksApi.reorderTasks([1])).resolves.toEqual([
      { id: 1, title: 'Updated', completed: true },
    ]);
    await expect(tasksApi.deleteTask(1)).resolves.toBeNull();
    await expect(tasksApi.deleteCompletedTasks()).resolves.toEqual({ deleted: 2 });
  });

  it('throws API errors from JSON bodies', async () => {
    fetch.mockResolvedValueOnce(
      mockResponse({ error: 'Task title is required' }, { ok: false, status: 400 }),
    );

    await expect(tasksApi.createTask('')).rejects.toThrow('Task title is required');
  });

  it('throws a fallback message when error bodies are not JSON', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    });

    await expect(tasksApi.getTasks()).rejects.toThrow('Request failed (500)');
  });
});
