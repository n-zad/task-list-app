/**
 * Frontend tests with React Testing Library.
 *
 * Cover main user flows:
 * - Renders task input
 * - Adds a task through the UI
 * - Displays tasks from API
 * - Toggles complete, deletes task
 * - Shows validation/error messages
 *
 * Expand coverage for filters, remaining count, edit mode, and clear completed.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

describe('App', () => {
  it('renders the task input', () => {
    render(<App />);
    expect(screen.getByLabelText(/new task title/i)).toBeInTheDocument();
  });
});
