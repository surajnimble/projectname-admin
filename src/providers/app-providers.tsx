'use client';

import { Suspense, type ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { HoverStyleProvider } from './hover-style-provider';
import { RippleProvider } from './ripple-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {/* useSearchParams in RippleProvider requires a Suspense boundary during prerender. */}
      <Suspense fallback={null}>
        <RippleProvider />
        <HoverStyleProvider />
      </Suspense>
      <AuthProvider>
        {children}
        <ToastProvider />
      </AuthProvider>
    </ThemeProvider>
  );
}
