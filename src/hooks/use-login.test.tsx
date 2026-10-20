import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failure } from '@/types/api';
import { toAuthData } from '@/types/auth';
import { useLogin } from './use-login';

const signIn = vi.fn();
const login = vi.fn();
const logout = vi.fn();

vi.mock('@/providers/auth-provider', () => ({ useAuth: () => ({ signIn }) }));
vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    login: (...args: unknown[]) => login(...args),
    logout: (...args: unknown[]) => logout(...args),
  },
}));
vi.mock('@/lib/utils/toast', () => ({ showSuccess: vi.fn() }));

const success = (result: Record<string, unknown>) => ({
  status: true,
  message: 'ok',
  data: toAuthData(result),
});

describe('useLogin', () => {
  beforeEach(() => {
    signIn.mockReset();
    login.mockReset();
    logout.mockReset().mockResolvedValue(success({}));
  });

  it('signs the user in on success', async () => {
    login.mockResolvedValue(success({ accessToken: 't', rolesList: ['SUPER_ADMIN'] }));
    const { result } = renderHook(() => useLogin());

    let ok = false;
    await act(async () => {
      ok = await result.current.login('a@b.com', 'x');
    });

    expect(ok).toBe(true);
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(login.mock.calls[0]?.[0]).toMatchObject({ email: 'a@b.com', password: 'x' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('sends only email and password, since the backend rejects any other field', async () => {
    login.mockResolvedValue(success({ accessToken: 't', rolesList: ['SUPER_ADMIN'] }));
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login('a@b.com', 'x');
    });

    expect(Object.keys(login.mock.calls[0]?.[0] as object).sort()).toEqual(['email', 'password']);
  });

  it('uses phone when the identifier is not an email', async () => {
    login.mockResolvedValue(success({ accessToken: 't', rolesList: ['SUB_ADMIN'] }));
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login('8607582826', 'x');
    });
    expect(login.mock.calls[0]?.[0]).toMatchObject({ phone: '8607582826' });
    expect(login.mock.calls[0]?.[0]).not.toHaveProperty('email');
  });

  it('shows the API message on failure', async () => {
    login.mockResolvedValue(failure('Invalid email or password.', toAuthData));
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login('a@b.com', 'x');
    });
    expect(result.current.error).toBe('Invalid email or password.');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('rejects an account without a staff role', async () => {
    login.mockResolvedValue(success({ accessToken: 't', rolesList: ['SOMEONE_ELSE'] }));
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login('a@b.com', 'x');
    });
    expect(result.current.error).toMatch(/cannot access/i);
    expect(logout).toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('holds a 2FA challenge closed instead of signing in', async () => {
    login.mockResolvedValue(success({ twoFactorRequired: true }));
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login('a@b.com', 'x');
    });
    expect(result.current.error).toMatch(/not supported/i);
    expect(signIn).not.toHaveBeenCalled();
  });
});
