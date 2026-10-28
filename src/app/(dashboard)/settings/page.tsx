'use client';

import { MESSAGES } from '@/messages';

export default function SettingsPage() {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">{MESSAGES.common.settings}</h1>
        <p className="text-fg-muted text-sm">Configure theme appearance, density, radius, and animation preferences.</p>
      </div>
    </div>
  );
}
