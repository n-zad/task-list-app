import { useState } from 'react';

/**
 * Single task row with checkbox and delete button.
 *
 * Completed tasks should be visually distinct:
 * - Strikethrough text
 * - Muted color
 * - Checked checkbox
 *
 * Optional: Inline edit mode — click Edit, show input, Save/Cancel,
 * reject empty edited titles.
 */
export default function TaskItem({ task, onToggleComplete, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSaveEdit = () => {
    // TODO: Validate non-empty title, call onEdit(id, title), exit edit mode
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  return (
    <li className={`task-item${task.completed ? ' task-item--completed' : ''}`}>
      <input
        type="checkbox"
        className="task-item__checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {isEditing ? (
        <div className="task-item__edit">
          {/* TODO: Wire up edit input, Save, and Cancel buttons */}
          <input
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            aria-label="Edit task title"
          />
          <button type="button" onClick={handleSaveEdit}>Save</button>
          <button type="button" onClick={handleCancelEdit}>Cancel</button>
        </div>
      ) : (
        <span className="task-item__title">{task.title}</span>
      )}

      <div className="task-item__actions">
        {/* TODO: Show Edit button and wire setIsEditing(true) */}
        <button type="button" className="task-item__delete" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}
