import { useState } from 'react';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import './App.css';
import './components/tasks.css';

/**
 * Root component — owns task list state and coordinates API calls.
 *
 * Responsibilities:
 * - Load tasks on mount (tasksApi.getTasks)
 * - Handle create, update, delete actions
 * - Track loading and error state
 *
 * Optional enhancements:
 * - Filter state (all / active / completed)
 * - Remaining task count
 * - Clear completed action
 */
export default function App() {
  // TODO: Replace with tasks fetched from the backend
  const [tasks] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);

  // TODO: Wire up handlers that call tasksApi and update local state
  const handleAddTask = (_title) => {
    // tasksApi.createTask(title)
  };

  const handleToggleComplete = (_id) => {
    // tasksApi.updateTask(id, { completed: !task.completed })
  };

  const handleDeleteTask = (_id) => {
    // tasksApi.deleteTask(id)
  };

  const handleEditTask = (_id, _title) => {
    // tasksApi.updateTask(id, { title })
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Task List</h1>
        <p className="app__subtitle">Add, complete, and manage your tasks</p>
      </header>

      {error && <p className="app__error" role="alert">{error}</p>}

      <TaskForm onAdd={handleAddTask} disabled={loading} />

      <TaskList
        tasks={tasks}
        loading={loading}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
      />

      <footer className="app__footer">
        {/* TODO: Remaining count — e.g. "3 tasks remaining" */}
      </footer>
    </div>
  );
}
