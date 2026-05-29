import TaskItem from './TaskItem.jsx';

/**
 * Renders the list of tasks with loading and empty states.
 *
 * Optional: Accept a filter prop and show only matching tasks,
 * or filter in App.jsx before passing tasks down.
 */
export default function TaskList({
  tasks,
  loading = false,
  onToggleComplete,
  onDelete,
  onEdit,
}) {
  if (loading) {
    return <p className="task-list__status">Loading tasks…</p>;
  }

  if (tasks.length === 0) {
    return <p className="task-list__empty">No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
