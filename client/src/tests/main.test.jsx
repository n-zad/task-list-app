import { beforeEach, describe, expect, it, vi } from 'vitest';

const render = vi.fn();

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render })),
}));

describe('main', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.resetModules();
    render.mockClear();
  });

  it('mounts the app into the root element', async () => {
    const { createRoot } = await import('react-dom/client');
    await import('../main.jsx');

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(render).toHaveBeenCalled();
  });
});
