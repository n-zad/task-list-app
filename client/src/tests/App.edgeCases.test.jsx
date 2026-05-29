import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../App.jsx';

vi.mock('../components/TaskList.jsx', () => ({
  default: function MockTaskList({ onToggleComplete }) {
    useEffect(() => {
      onToggleComplete(999);
    }, [onToggleComplete]);

    return null;
  },
}));

function mockFetchResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe('App edge cases', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockFetchResponse([
          {
            id: 1,
            title: 'Active task',
            completed: false,
            position: 0,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ]),
      ),
    );
  });

  it('ignores toggle requests for tasks that are not in state', async () => {
    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
