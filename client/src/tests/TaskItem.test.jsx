import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../components/TaskItem.jsx';

const task = {
  id: 1,
  title: 'Sample task',
  completed: false,
};

describe('TaskItem', () => {
  it('toggles completion and deletes a task', async () => {
    const onToggleComplete = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskItem
        task={task}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onToggleComplete).toHaveBeenCalledWith(1);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('edits, saves, and cancels task titles', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <TaskItem
        task={task}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const input = screen.getByLabelText('Edit task title');
    await user.clear(input);
    await user.type(input, 'Updated title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEdit).toHaveBeenCalledWith(1, 'Updated title');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Edit task title'));
    await user.type(screen.getByLabelText('Edit task title'), 'Discarded');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Sample task')).toBeInTheDocument();
  });

  it('stays in edit mode when saving fails', async () => {
    const onEdit = vi.fn().mockRejectedValue(new Error('Edit failed'));
    const user = userEvent.setup();

    render(
      <TaskItem
        task={task}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEdit).toHaveBeenCalled();
    expect(screen.getByLabelText('Edit task title')).toBeInTheDocument();
  });

  it('ignores blank edit submissions', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskItem
        task={task}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Edit task title'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('shows a drag handle when reordering is enabled', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();

    render(
      <TaskItem
        task={task}
        canReorder
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "Sample task"',
    });

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });
    fireEvent.dragEnd(handle);

    expect(onDragStart).toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalled();
  });

  it('applies completed and dragging styles', () => {
    const { container, rerender } = render(
      <TaskItem
        task={{ ...task, completed: true }}
        isDragging
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(container.querySelector('.task-item--completed')).toBeTruthy();
    expect(container.querySelector('.task-item--dragging')).toBeTruthy();

    rerender(
      <TaskItem
        task={task}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
  });
});
