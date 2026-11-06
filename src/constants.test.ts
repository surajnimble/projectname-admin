import { describe, expect, it } from 'vitest';
import { NAV_GROUPS, NAV_ITEMS, ROUTES } from './constants';

describe('sidebar navigation groups', () => {
  it('places every operational navigation item in exactly one group', () => {
    const groupedRoutes = NAV_GROUPS.flatMap((group) => [...group.routes]);
    const expectedRoutes = NAV_ITEMS
      .filter((item) => item.href !== ROUTES.home && item.href !== ROUTES.componentsShowcase)
      .map((item) => item.href);

    expect(new Set(groupedRoutes).size).toBe(groupedRoutes.length);
    expect([...groupedRoutes].sort()).toEqual([...expectedRoutes].sort());
  });
});
