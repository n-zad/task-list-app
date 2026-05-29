import { useCallback, useEffect, useMemo, useState } from 'react';
import * as tasksApi from './api/tasksApi.js';
import TaskFilter from './components/TaskFilter.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import './App.css';
import './components/tasks.css';

function filterTasks(tasks, filter) {
  if (filter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (filter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function getEmptyMessage(filter, totalCount, filteredCount) {
  if (totalCount === 0) {
    return 'No tasks yet. Add one above.';
  }

  if (filteredCount > 0) {
    return null;
  }

  if (filter === 'active') {
    return 'No active tasks.';
  }

  if (filter === 'completed') {
    return 'No completed tasks.';
  }

  return 'No tasks yet. Add one above.';
}

function formatRemainingCount(count) {
  return count === 1 ? '1 task remaining' : `${count} tasks remaining`;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filter),
    [tasks, filter],
  );

  const remainingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );

  const hasCompletedTasks = useMemo(
    () => tasks.some((task) => task.completed),
    [tasks],
  );

  const emptyMessage = getEmptyMessage(filter, tasks.length, filteredTasks.length);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (title) => {
    try {
      setBusy(true);
      setError(null);
      const task = await tasksApi.createTask(title);
      setTasks((current) => [task, ...current]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleToggleComplete = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }

    try {
      setError(null);
      const updated = await tasksApi.updateTask(id, {
        completed: !task.completed,
      });
      setTasks((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setError(null);
      await tasksApi.deleteTask(id);
      setTasks((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTask = async (id, title) => {
    try {
      setError(null);
      const updated = await tasksApi.updateTask(id, { title });
      setTasks((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleClearCompleted = async () => {
    try {
      setBusy(true);
      setError(null);
      await tasksApi.deleteCompletedTasks();
      setTasks((current) => current.filter((task) => !task.completed));

      if (filter === 'completed') {
        setFilter('all');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isDisabled = loading || busy;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Task List</h1>
        <p className="app__subtitle">Add, complete, and manage your tasks</p>
      </header>

      {error && (
        <p className="app__error" role="alert">
          {error}
        </p>
      )}

      <TaskForm onAdd={handleAddTask} disabled={isDisabled} />

      {!loading && tasks.length > 0 && (
        <TaskFilter filter={filter} onFilterChange={setFilter} />
      )}

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        emptyMessage={emptyMessage}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
      />

      {!loading && (
        <footer className="app__footer">
          <span className="app__count">{formatRemainingCount(remainingCount)}</span>
          {hasCompletedTasks && (
            <button
              type="button"
              className="app__clear-completed"
              onClick={handleClearCompleted}
              disabled={isDisabled}
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </div>
  );
}
