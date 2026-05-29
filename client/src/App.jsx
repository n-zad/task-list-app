import { useCallback, useEffect, useState } from 'react';
import * as tasksApi from './api/tasksApi.js';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import './App.css';
import './components/tasks.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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

      <TaskList
        tasks={tasks}
        loading={loading}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
      />
    </div>
  );
}
