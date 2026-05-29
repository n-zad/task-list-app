import { Router } from 'express';
import { getDb } from '../db/index.js';
import * as taskStore from '../db/tasks.js';
import {
  normalizeTitle,
  parseReorderBody,
  parseStatusQuery,
  parseTaskId,
  parseTaskUpdates,
} from './validation.js';

const router = Router();

router.get('/', (req, res) => {
  const statusResult = parseStatusQuery(req.query.status);

  if (statusResult.error) {
    return res.status(400).json({ error: statusResult.error });
  }

  const tasks = taskStore.listTasks(getDb(), { status: statusResult.status });
  return res.json(tasks);
});

router.post('/', (req, res) => {
  const title = normalizeTitle(req.body?.title);

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const task = taskStore.createTask(getDb(), title);
  return res.status(201).json(task);
});

router.put('/reorder', (req, res) => {
  const parsed = parseReorderBody(req.body);

  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const tasks = taskStore.reorderTasks(getDb(), parsed.order);
    return res.json(tasks);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', (req, res) => {
  const id = parseTaskId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  const parsed = parseTaskUpdates(req.body);

  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const task = taskStore.updateTask(getDb(), id, parsed.updates);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  return res.json(task);
});

router.delete('/completed', (_req, res) => {
  const deleted = taskStore.deleteCompletedTasks(getDb());
  return res.json({ deleted });
});

router.delete('/:id', (req, res) => {
  const id = parseTaskId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  const deleted = taskStore.deleteTask(getDb(), id);

  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  return res.status(204).send();
});

export default router;
