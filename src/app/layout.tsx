import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SITE } from '@/constants';
import { AppProviders } from '@/providers/app-providers';
import { fontSans } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontSans.variable}>
      <body className="min-h-dvh antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
