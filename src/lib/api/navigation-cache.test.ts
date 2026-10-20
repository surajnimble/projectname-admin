import { describe, expect, it, vi } from 'vitest';
import { onScopeDropped, resetNavigationCache, trackPath } from './navigation-cache';

describe('navigation cache', () => {
  it('drops the screens ahead when going back', () => {
    resetNavigationCache();
    const dropped = vi.fn();
    const off = onScopeDropped(dropped);

    trackPath('/vendors');
    trackPath('/vendors/v1');
    trackPath('/vendors/v1/products/p1');
    expect(dropped).not.toHaveBeenCalled();

    trackPath('/vendors/v1');

    expect(dropped).toHaveBeenCalledWith('/vendors/v1/products/p1');
    off();
  });

  it('keeps the screens behind when moving forward', () => {
    resetNavigationCache();
    const dropped = vi.fn();
    const off = onScopeDropped(dropped);

    trackPath('/vendors');
    trackPath('/vendors/v1');
    trackPath('/vendors');

    expect(dropped).toHaveBeenCalledWith('/vendors/v1');
    off();
  });

  it('does not drop anything for a new screen', () => {
    resetNavigationCache();
    const dropped = vi.fn();
    const off = onScopeDropped(dropped);

    trackPath('/payments');

    expect(dropped).not.toHaveBeenCalled();
    off();
  });
});
