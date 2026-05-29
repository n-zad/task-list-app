import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('shows remaining task count', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));

    render(<App />);

    expect(await screen.findByText('1 task remaining')).toBeInTheDocument();
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

  it('shows clear completed when completed tasks exist', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Clear completed' })).toBeEnabled();
  });

  it('shows reorder hint on the all filter', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse(sampleTasks));

    render(<App />);

    expect(await screen.findByText('Drag tasks to reorder')).toBeInTheDocument();
  });
});
