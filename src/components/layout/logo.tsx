import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-8', className)}>
      <rect x="3" y="3" width="12" height="12" rx="3" className="fill-current" />
      <rect x="17" y="3" width="12" height="12" rx="3" className="fill-current opacity-60" />
      <rect x="3" y="17" width="12" height="12" rx="3" className="fill-current opacity-60" />
      <rect x="17" y="17" width="12" height="12" rx="3" className="fill-current" />
    </svg>
  );
}
