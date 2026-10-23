'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={[
        'light',
        'dark',
        'system',
        'luxury',
        'retro',
        'arctic',
        'nature',
        'ember',
        'dracula',
        'midnight',
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
