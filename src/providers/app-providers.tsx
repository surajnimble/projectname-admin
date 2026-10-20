'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ToastProvider />
      </AuthProvider>
    </ThemeProvider>
  );
}
