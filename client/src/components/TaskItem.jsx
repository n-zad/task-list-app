import { useEffect, useState } from 'react';

export default function TaskItem({
  task,
  canReorder = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onToggleComplete,
  onDelete,
  onEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  const handleSaveEdit = async () => {
    const trimmed = editTitle.trim();

    if (!trimmed) {
      return;
    }

    try {
      await onEdit(task.id, trimmed);
      setIsEditing(false);
    } catch {
      // Parent displays the error.
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  return (
    <li
      className={[
        'task-item',
        task.completed ? 'task-item--completed' : '',
        isDragging ? 'task-item--dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {canReorder && !isEditing && (
        <button
          type="button"
          className="task-item__drag-handle"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(task.id));
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          aria-label={`Drag to reorder "${task.title}"`}
        >
          ⋮⋮
        </button>
      )}

      <input
        type="checkbox"
        className="task-item__checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {isEditing ? (
        <div className="task-item__editor">
          <input
            type="text"
            className="task-item__edit-input"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            aria-label="Edit task title"
          />
          <button type="button" className="task-item__save" onClick={handleSaveEdit}>
            Save
          </button>
          <button type="button" className="task-item__cancel" onClick={handleCancelEdit}>
            Cancel
          </button>
        </div>
      ) : (
        <span className="task-item__title">{task.title}</span>
      )}

      <div className="task-item__actions">
        {!isEditing && (
          <button
            type="button"
            className="task-item__edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
        <button
          type="button"
          className="task-item__delete"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
