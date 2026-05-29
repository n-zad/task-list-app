import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const sampleTasks = [
  {
    id: 1,
    title: 'Active task',
    completed: false,
    position: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Done task',
    completed: true,
    position: 1,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

function mockFetchResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

function mockFetchSequence(...responses) {
  responses.forEach((response) => {
    fetch.mockResolvedValueOnce(response);
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockFetchResponse([])),
    );
  });

  it('renders the task input', async () => {
    render(<App />);

    expect(screen.getByLabelText(/new task title/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
    });
  });

  it('shows a load error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network down'));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Network down');
  });

  it('shows remaining task count', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));

    render(<App />);

    expect(await screen.findByText('1 task remaining')).toBeInTheDocument();
  });

  it('uses the plural remaining label', async () => {
    fetch.mockResolvedValueOnce(
      mockFetchResponse([
        sampleTasks[0],
        { ...sampleTasks[0], id: 3, title: 'Another active' },
      ]),
    );

    render(<App />);

    expect(await screen.findByText('2 tasks remaining')).toBeInTheDocument();
  });

  it('adds a task from the form', async () => {
    mockFetchSequence(
      mockFetchResponse([]),
      mockFetchResponse({
        id: 3,
        title: 'Brand new',
        completed: false,
        position: 0,
        createdAt: '2026-01-03T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('No tasks yet. Add one above.');

    await user.type(screen.getByLabelText(/new task title/i), 'Brand new');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Brand new')).toBeInTheDocument();
  });

  it('shows an error when creating a task fails', async () => {
    mockFetchSequence(
      mockFetchResponse([]),
      mockFetchResponse({ error: 'Task title is required' }, { ok: false, status: 400 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('No tasks yet. Add one above.');

    await user.type(screen.getByLabelText(/new task title/i), 'Broken');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Task title is required');
  });

  it('filters tasks by completion status', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText('Active task');

    await user.click(screen.getByRole('button', { name: 'Completed' }));

    expect(screen.getByText('Done task')).toBeInTheDocument();
    expect(screen.queryByText('Active task')).not.toBeInTheDocument();
  });

  it('shows empty-state messages for filtered views', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse([sampleTasks[0]]));
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText('Active task');

    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.getByText('No completed tasks.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByText('Active task')).toBeInTheDocument();
  });

  it('toggles, edits, and deletes tasks', async () => {
    mockFetchSequence(
      mockFetchResponse([sampleTasks[0]]),
      mockFetchResponse({ ...sampleTasks[0], completed: true }),
      mockFetchResponse({ ...sampleTasks[0], title: 'Renamed' }),
      mockFetchResponse(null, { status: 204 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Active task');

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const input = screen.getByLabelText('Edit task title');
    await user.clear(input);
    await user.type(input, 'Renamed');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Renamed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(screen.queryByText('Renamed')).not.toBeInTheDocument();
    });
  });

  it('shows clear completed when completed tasks exist', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Clear completed' })).toBeEnabled();
  });

  it('clears completed tasks and resets the completed filter', async () => {
    mockFetchSequence(
      mockFetchResponse(sampleTasks),
      mockFetchResponse({ deleted: 1 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Active task');
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    await waitFor(() => {
      expect(screen.queryByText('Done task')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Active task')).toBeInTheDocument();
  });

  it('shows reorder hint on the all filter', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));

    render(<App />);

    expect(await screen.findByText('Drag tasks to reorder')).toBeInTheDocument();
  });

  it('persists a successful reorder', async () => {
    const reordered = [
      { ...sampleTasks[1], position: 0 },
      { ...sampleTasks[0], position: 1 },
    ];

    mockFetchSequence(
      mockFetchResponse(sampleTasks),
      mockFetchResponse(reordered),
    );

    render(<App />);

    await screen.findByText('Drag tasks to reorder');

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "Active task"',
    });

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(document, {
      clientY: 250,
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: 'move' },
    });
    fireEvent.drop(document, { preventDefault: vi.fn() });

    await waitFor(() => {
      const titles = [...document.querySelectorAll('.task-item__title')].map(
        (node) => node.textContent,
      );
      expect(titles).toEqual(['Done task', 'Active task']);
    });
  });

  it('shows an error when editing a task fails', async () => {
    mockFetchSequence(
      mockFetchResponse([sampleTasks[0]]),
      mockFetchResponse({ error: 'Edit failed' }, { ok: false, status: 400 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Active task');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Edit task title'));
    await user.type(screen.getByLabelText('Edit task title'), 'Broken edit');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Edit failed');
    expect(screen.getByLabelText('Edit task title')).toHaveValue('Broken edit');
  });

  it('restores tasks when reordering fails', async () => {
    mockFetchSequence(
      mockFetchResponse(sampleTasks),
      mockFetchResponse({ error: 'Reorder failed' }, { ok: false, status: 400 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Drag tasks to reorder');

    const handle = screen.getByRole('button', {
      name: 'Drag to reorder "Active task"',
    });

    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(document, {
      clientY: 250,
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: 'move' },
    });
    fireEvent.drop(document, { preventDefault: vi.fn() });

    expect(await screen.findByRole('alert')).toHaveTextContent('Reorder failed');
    expect(screen.getByText('Active task')).toBeInTheDocument();
  });

  it('shows action errors without removing tasks', async () => {
    mockFetchSequence(
      mockFetchResponse([sampleTasks[0]]),
      mockFetchResponse({ error: 'Update failed' }, { ok: false, status: 500 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Active task');
    await user.click(screen.getByRole('checkbox'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Update failed');
    expect(screen.getByText('Active task')).toBeInTheDocument();
  });

  it('shows an error when deleting a task fails', async () => {
    mockFetchSequence(
      mockFetchResponse(sampleTasks),
      mockFetchResponse({ error: 'Delete failed' }, { ok: false, status: 500 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Active task');

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    expect(await screen.findByRole('alert')).toHaveTextContent('Delete failed');
    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });

  it('shows an error when clearing completed tasks fails', async () => {
    mockFetchSequence(
      mockFetchResponse(sampleTasks),
      mockFetchResponse({ error: 'Clear failed' }, { ok: false, status: 500 }),
    );

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Done task');
    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Clear failed');
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });
});
