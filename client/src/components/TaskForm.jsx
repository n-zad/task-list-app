import { useState } from 'react';

export default function TaskForm({ onAdd, disabled = false }) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      return;
    }

    try {
      await onAdd(trimmed);
      setTitle('');
    } catch {
      // Parent displays the error; keep the input value for retry.
    }
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
