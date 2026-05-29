export function parseTaskId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export function normalizeTitle(title) {
  if (typeof title !== 'string') {
    return null;
  }

  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseStatusQuery(status) {
  if (status === undefined) {
    return { status: undefined };
  }

  if (status === 'active' || status === 'completed') {
    return { status };
  }

  return { error: 'status must be "active" or "completed"' };
}

export function parseTaskUpdates(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid request body' };
  }

  const hasTitle = Object.hasOwn(body, 'title');
  const hasCompleted = Object.hasOwn(body, 'completed');

  if (!hasTitle && !hasCompleted) {
    return { error: 'No valid fields to update' };
  }

  const updates = {};

  if (hasTitle) {
    const title = normalizeTitle(body.title);

    if (!title) {
      return { error: 'Task title is required' };
    }

    updates.title = title;
  }

  if (hasCompleted) {
    if (typeof body.completed !== 'boolean') {
      return { error: 'completed must be a boolean' };
    }

    updates.completed = body.completed;
  }

  return { updates };
}

export function parseReorderBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid request body' };
  }

  if (!Array.isArray(body.order)) {
    return { error: 'order must be an array of task ids' };
  }

  const order = body.order.map((value) => Number(value));

  if (order.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { error: 'order must contain valid task ids' };
  }

  if (new Set(order).size !== order.length) {
    return { error: 'order must not contain duplicate ids' };
  }

  return { order };
}
