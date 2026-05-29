import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm.jsx';

describe('TaskForm', () => {
  it('submits a trimmed title and clears the input', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TaskForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/new task title/i), '  New task  ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledWith('New task');
    expect(screen.getByLabelText(/new task title/i)).toHaveValue('');
  });

  it('ignores blank submissions', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/new task title/i), '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('keeps the input when submission fails', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('Save failed'));
    const user = userEvent.setup();

    render(<TaskForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/new task title/i), 'Retry me');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByLabelText(/new task title/i)).toHaveValue('Retry me');
  });
});
