import cors from 'cors';
import express from 'express';
import tasksRouter from './routes/tasks.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRouter);

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

app.use(errorHandler);

export default app;
