import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/messages';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-border bg-surface flex flex-col items-center gap-3 rounded-lg border px-6 py-10 text-center"
    >
      <AlertTriangle className="text-danger size-6" aria-hidden="true" />
      <p className="text-fg-muted max-w-sm text-sm">{message || MESSAGES.errors.unknown}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {MESSAGES.common.retry}
        </Button>
      )}
    </div>
  );
}
