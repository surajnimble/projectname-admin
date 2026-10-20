'use client';

import { ErrorState } from '@/components/common/error-state';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <ErrorState message={error.message} onRetry={reset} />
    </div>
  );
}
