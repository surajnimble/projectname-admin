import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        'bg-danger-bg text-danger flex items-start gap-2 rounded-md px-3 py-2.5 text-sm',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
