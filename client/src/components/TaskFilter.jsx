/**
 * Filter controls — All / Active / Completed.
 *
 * Can filter on the frontend (simple for small lists) or pass status
 * to tasksApi.getTasks(status) for server-side filtering.
 */
export default function TaskFilter({ filter, onFilterChange }) {
  const options = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <nav className="task-filter" aria-label="Filter tasks">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`task-filter__button${filter === value ? ' task-filter__button--active' : ''}`}
          onClick={() => onFilterChange(value)}
          aria-pressed={filter === value}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
