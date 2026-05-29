import { useState } from 'react';

/**
 * Form for adding a new task.
 *
 * - Input field + Add button
 * - Disable while loading
 * - Show validation/error feedback from parent
 */
export default function TaskForm({ onAdd, disabled = false }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = title.trim();

    // Optionally validate client-side; backend is source of truth
    if (!trimmed) {
      return;
    }

    onAdd(trimmed);
    setTitle('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-form__input"
        placeholder="What needs to be done?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={disabled}
        aria-label="New task title"
      />
      <button type="submit" className="task-form__button" disabled={disabled}>
        Add
      </button>
    </form>
  );
}
