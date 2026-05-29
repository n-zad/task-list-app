const API_BASE = '/api/tasks';

/**
 * Centralized API wrapper for task operations.
 * Keeps fetch logic out of components and simplifies testing.
 */

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/** GET /api/tasks — fetch all tasks, optionally filtered by status */
export async function getTasks(status) {
  const url =
    status && status !== 'all'
      ? `${API_BASE}?status=${encodeURIComponent(status)}`
      : API_BASE;

  return request(url);
}

/** POST /api/tasks — create a new task */
export function createTask(title) {
  return request(API_BASE, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

/** PATCH /api/tasks/:id — update title and/or completed */
export function updateTask(id, updates) {
  return request(`${API_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/** DELETE /api/tasks/:id — remove a single task */
export function deleteTask(id) {
  return request(`${API_BASE}/${id}`, { method: 'DELETE' });
}

/** DELETE /api/tasks/completed — clear all completed tasks */
export function deleteCompletedTasks() {
  return request(`${API_BASE}/completed`, { method: 'DELETE' });
}
