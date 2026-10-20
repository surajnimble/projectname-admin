import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toEmptyData } from '@/types/auth';
import { resetHealthStore, useHealth } from './use-health';

const ok = { status: true, message: 'ok', data: toEmptyData() };

describe('useHealth', () => {
  beforeEach(() => resetHealthStore());

  it('calls the API once even when several components use it at the same time', async () => {
    const check = vi.fn().mockResolvedValue(ok);
    const first = renderHook(() => useHealth(check));
    const second = renderHook(() => useHealth(check));

    await waitFor(() => expect(first.result.current.status).toBe('online'));
    expect(second.result.current.status).toBe('online');
    expect(check).toHaveBeenCalledTimes(1);
  });

  it('reuses a fresh result when a screen mounts again', async () => {
    const check = vi.fn().mockResolvedValue(ok);
    const first = renderHook(() => useHealth(check));
    await waitFor(() => expect(first.result.current.status).toBe('online'));
    first.unmount();

    const again = renderHook(() => useHealth(check));
    expect(again.result.current.status).toBe('online');
    expect(check).toHaveBeenCalledTimes(1);
  });
});
