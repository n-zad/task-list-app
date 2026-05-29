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
    // Parse { error: string } from backend and throw for UI handling
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/** GET /api/tasks — fetch all tasks */
export async function getTasks(/* status */) {
  // Optional: append ?status=active or ?status=completed when filtering via API
  // return request(API_BASE);
  throw new Error('getTasks() not implemented yet');
}

/** POST /api/tasks — create a new task */
export async function createTask(title) {
  // return request(API_BASE, { method: 'POST', body: JSON.stringify({ title }) });
  throw new Error('createTask() not implemented yet');
}

/** PATCH /api/tasks/:id — update title and/or completed */
export async function updateTask(id, updates) {
  // return request(`${API_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  throw new Error('updateTask() not implemented yet');
}

/** DELETE /api/tasks/:id — remove a single task */
export async function deleteTask(id) {
  // return request(`${API_BASE}/${id}`, { method: 'DELETE' });
  throw new Error('deleteTask() not implemented yet');
}

/** DELETE /api/tasks/completed — clear all completed tasks */
export async function deleteCompletedTasks() {
  // return request(`${API_BASE}/completed`, { method: 'DELETE' });
  throw new Error('deleteCompletedTasks() not implemented yet');
}
