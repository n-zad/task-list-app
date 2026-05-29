import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import TaskList, {
  getInsertIndexFromPointer,
  moveTask,
  useTaskListReorder,
} from '../components/TaskList.jsx';

function mockItem(top, height) {
  return {
    getBoundingClientRect: () => ({
      top,
      bottom: top + height,
      height,
    }),
  };
}

const tasks = [
  { id: 1, title: 'First', completed: false },
  { id: 2, title: 'Second', completed: false },
  { id: 3, title: 'Third', completed: false },
];

describe('getInsertIndexFromPointer', () => {
  const items = [mockItem(100, 40), mockItem(140, 40), mockItem(180, 40)];

  it('returns zero when there are no item elements', () => {
    expect(getInsertIndexFromPointer(100, [])).toBe(0);
  });

  it('selects the top slot when the pointer is above the list', () => {
    expect(getInsertIndexFromPointer(80, items)).toBe(0);
  });

  it('selects the bottom slot when the pointer is below the list', () => {
    expect(getInsertIndexFromPointer(230, items)).toBe(3);
  });

  it('uses vertical position only for slots between tasks', () => {
    expect(getInsertIndexFromPointer(155, items)).toBe(2);
  });
});

describe('moveTask', () => {
  it('returns the original order for invalid moves', () => {
    expect(moveTask([1, 2, 3], 99, 1)).toEqual([1, 2, 3]);
    expect(moveTask([1, 2, 3], 1, -1)).toEqual([1, 2, 3]);
    expect(moveTask([1, 2, 3], 1, 1)).toEqual([1, 2, 3]);
  });

  it('moves a task to a new index', () => {
    expect(moveTask([1, 2, 3], 1, 3)).toEqual([2, 3, 1]);
  });
});

describe('useTaskListReorder', () => {
  it('aborts drop when reordering is disabled', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useTaskListReorder({ canReorder: false, tasks, onReorder }),
    );

    act(() => {
      result.current.startDrag(1, 0);
    });
    act(() => {
      result.current.handleDrop();
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('aborts drop when there is no dragged task', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useTaskListReorder({ canReorder: true, tasks, onReorder }),
    );

    act(() => {
      result.current.handleDrop();
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('aborts drop when the insert index is missing', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useTaskListReorder({ canReorder: true, tasks, onReorder }),
    );

    act(() => {
      result.current.startDrag(1, null);
    });
    act(() => {
      result.current.handleDrop();
    });

    expect(onReorder).not.toHaveBeenCalled();
  });
});

describe('TaskList', () => {
  it('shows loading and empty states', () => {
    const { rerender } = render(
      <TaskList
        tasks={[]}
        loading
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Loading tasks…')).toBeInTheDocument();

    rerender(
      <TaskList
        tasks={[]}
        emptyMessage="Nothing here"
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('reorders tasks after a drag and drop', () => {
    const onReorder = vi.fn();

    render(
      <TaskList
        tasks={tasks}
        canReorder
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onReorder={onReorder}
      />,
    );

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "First"',
    });

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });

    fireEvent.dragOver(document, {
      clientY: 200,
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: 'move' },
    });

    fireEvent.drop(document, { preventDefault: vi.fn() });

    expect(onReorder).toHaveBeenCalled();
  });

  it('ignores drop events when reordering is disabled', () => {
    const onReorder = vi.fn();

    render(
      <TaskList
        tasks={tasks}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onReorder={onReorder}
      />,
    );

    fireEvent.drop(document, { preventDefault: vi.fn() });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('clears drag state when a drag ends', () => {
    const { container } = render(
      <TaskList
        tasks={tasks}
        canReorder
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onReorder={vi.fn()}
      />,
    );

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "First"',
    });

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });
    expect(container.querySelector('.task-list--dragging')).toBeTruthy();

    fireEvent.dragEnd(handle);
    expect(container.querySelector('.task-list--dragging')).toBeFalsy();
  });

  it('ignores drop events without an active drag', () => {
    const onReorder = vi.fn();

    render(
      <TaskList
        tasks={tasks}
        canReorder
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onReorder={onReorder}
      />,
    );

    fireEvent.drop(document, { preventDefault: vi.fn() });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('ignores drop events after a drag has already ended', () => {
    const onReorder = vi.fn();

    render(
      <TaskList
        tasks={tasks}
        canReorder
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onReorder={onReorder}
      />,
    );

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "First"',
    });

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });
    fireEvent.dragEnd(handle);
    fireEvent.drop(document, { preventDefault: vi.fn() });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('ignores dragover updates when no task elements are found', () => {
    const { container } = render(
      <TaskList
        tasks={tasks}
        canReorder
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onReorder={vi.fn()}
      />,
    );

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "First"',
    });
    const list = container.querySelector('.task-list');
    vi.spyOn(list, 'querySelectorAll').mockReturnValue([]);

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });

    fireEvent.dragOver(document, {
      clientY: 120,
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: 'move' },
    });
  });
});
