import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md',
        'bg-[var(--skeleton-color)] opacity-[var(--skeleton-opacity)]',
        'animate-[pulse_var(--skeleton-speed)_infinite]',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
