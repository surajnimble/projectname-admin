'use client';

import { useCallback } from 'react';
import { hasPermission } from '@/lib/api/auth';
import { useAuth } from '@/providers/auth-provider';

export function usePermission() {
  const { user } = useAuth();
  const can = useCallback((permission?: string) => !permission || hasPermission(user, permission), [user]);
  return { can };
}
