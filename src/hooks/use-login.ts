import { useCallback, useState } from 'react';
import { MESSAGES } from '@/messages';
import { isAllowedUser, toSessionUser } from '@/lib/api/auth';
import { clearSession, setAccessToken } from '@/lib/api/session';
import { showSuccess } from '@/lib/utils/toast';
import { identifierToCredentials } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { apiService } from '@/lib/api/api.service';

export function useLogin() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError('');

      const response = await apiService.login({
        ...identifierToCredentials(identifier),
        password,
      });

      const fail = (message: string) => {
        setError(message);
        setIsLoading(false);
        return false;
      };

      if (!response.status) return fail(response.message);
      const { data } = response;
      if (data.twoFactorRequired) return fail(MESSAGES.auth.twoFactorUnsupported);
      if (!data.accessToken) return fail(MESSAGES.errors.unknown);

      if (!isAllowedUser(toSessionUser(data).roles)) {
        setAccessToken(data.accessToken);
        await apiService.logout();
        clearSession();
        return fail(MESSAGES.auth.notStaff);
      }

      signIn(data);
      showSuccess(MESSAGES.auth.loggedIn);
      setIsLoading(false);
      return true;
    },
    [signIn],
  );

  return { login, isLoading, error };
}
