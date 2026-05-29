import { Router } from 'express';

const router = Router();

/**
 * GET /api/tasks
 * Returns all tasks ordered by created_at descending.
 *
 * Optional: Support ?status=active or ?status=completed query filters.
 */
router.get('/', (_req, res) => {
  // TODO: Query tasks from SQLite and return JSON array
  res.status(501).json({ error: 'Not implemented yet' });
});

/**
 * POST /api/tasks
 * Body: { title: string }
 *
 * Validation:
 * - Reject missing or whitespace-only titles (400)
 * - Trim title before saving
 */
router.post('/', (_req, res) => {
  // TODO: Validate body, insert row, return created task (201)
  res.status(501).json({ error: 'Not implemented yet' });
});

/**
 * PATCH /api/tasks/:id
 * Body: { title?: string, completed?: boolean }
 *
 * Validation:
 * - Return 404 if task not found
 * - Reject empty edited titles (400)
 * - Allow updating title, completed, or both
 */
router.patch('/:id', (_req, res) => {
  // TODO: Validate id and body, update row, return updated task
  res.status(501).json({ error: 'Not implemented yet' });
});

/**
 * DELETE /api/tasks/completed
 * Deletes all completed tasks. Must be registered BEFORE /:id to avoid route conflicts.
 */
router.delete('/completed', (_req, res) => {
  // TODO: Delete rows where completed = 1, return count removed
  res.status(501).json({ error: 'Not implemented yet' });
});

/**
 * DELETE /api/tasks/:id
 * Returns 404 if the task does not exist.
 */
router.delete('/:id', (_req, res) => {
  // TODO: Validate id, delete row, return 204
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
