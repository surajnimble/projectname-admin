'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { EVENTS, ROUTES } from '@/constants';
import { isAllowedUser, isSuperAdmin, toSessionUser } from '@/lib/api/auth';
import {
  clearSession,
  hasSignedInHint,
  onSessionCleared,
  setAccessToken,
  setSignedInHint,
} from '@/lib/api/session';
import { apiService } from '@/lib/api/api.service';
import type { AuthData } from '@/lib/api/contract';
import type { SessionUser } from '@/types/auth';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface State {
  status: SessionStatus;
  user: SessionUser | null;
}

type Action = { type: 'authenticated'; user: SessionUser } | { type: 'unauthenticated' };

const reducer = (_: State, action: Action): State =>
  action.type === 'authenticated'
    ? { status: 'authenticated', user: action.user }
    : { status: 'unauthenticated', user: null };

interface AuthContextValue {
  status: SessionStatus;
  user: SessionUser | null;
  signIn: (data: AuthData) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}

async function fetchMe(): Promise<SessionUser | null> {
  const me = await apiService.getMe();
  return me.status ? toSessionUser(me.data) : null;
}

let bootstrapping: Promise<SessionUser | null> | null = null;

// Shared promise: React strict mode runs effects twice and refresh tokens rotate, so a second
// refresh would sign the user out.
function bootstrapSession(): Promise<SessionUser | null> {
  bootstrapping ??= (async () => {
    const refreshed = await apiService.refreshToken();
    if (!refreshed.status || !refreshed.data.accessToken) return null;
    setAccessToken(refreshed.data.accessToken);
    return fetchMe();
  })().finally(() => {
    bootstrapping = null;
  });
  return bootstrapping;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { status: 'loading', user: null });
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasSignedInHint()) {
        dispatch({ type: 'unauthenticated' });
        return;
      }
      const user = await bootstrapSession();
      if (cancelled) return;
      if (user && isAllowedUser(user.roles)) {
        dispatch({ type: 'authenticated', user });
      } else {
        clearSession();
        dispatch({ type: 'unauthenticated' });
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => onSessionCleared(() => dispatch({ type: 'unauthenticated' })), []);

  useEffect(() => {
    const onMaintenance = () => {
      if (!isSuperAdmin(state.user?.roles ?? [])) router.replace(ROUTES.maintenance);
    };
    window.addEventListener(EVENTS.maintenance, onMaintenance);
    return () => window.removeEventListener(EVENTS.maintenance, onMaintenance);
  }, [router, state.user]);

  const signIn = useCallback((data: AuthData) => {
    setAccessToken(data.accessToken);
    setSignedInHint(true);
    const user = toSessionUser(data);
    dispatch({ type: 'authenticated', user });
    if (!user.userId && !user.email) {
      void fetchMe()
        .then((me) => me && dispatch({ type: 'authenticated', user: me }))
        .catch(() => undefined);
    }
  }, []);

  const signOut = useCallback(async () => {
    await apiService.logout();
    clearSession();
    router.replace(ROUTES.login);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ status: state.status, user: state.user, signIn, signOut }),
    [state.status, state.user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
