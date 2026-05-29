import { describe, expect, it } from 'vitest';
import { getInsertIndexFromPointer } from '../components/TaskList.jsx';

function mockItem(top, height) {
  return {
    getBoundingClientRect: () => ({
      top,
      bottom: top + height,
      height,
    }),
  };
}

describe('getInsertIndexFromPointer', () => {
  const items = [mockItem(100, 40), mockItem(140, 40), mockItem(180, 40)];

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
