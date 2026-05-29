import TaskItem from './TaskItem.jsx';

export default function TaskList({
  tasks,
  loading = false,
  emptyMessage = 'No tasks yet. Add one above.',
  onToggleComplete,
  onDelete,
  onEdit,
}) {
  if (loading) {
    return <p className="task-list__status">Loading tasks…</p>;
  }

  if (tasks.length === 0) {
    return <p className="task-list__empty">{emptyMessage}</p>;
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
