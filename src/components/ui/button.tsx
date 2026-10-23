import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-medium whitespace-nowrap transition-all before:pointer-events-none before:absolute before:inset-0 before:bg-primary before:opacity-0 before:transition-opacity before:duration-200 before:content-[''] hover:shadow-sm hover:before:opacity-5 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-fg hover:bg-primary-hover before:hidden [--ripple-color:var(--primary-fg)]',
        secondary: 'bg-secondary text-secondary-fg hover:bg-soft hover:text-soft-fg',
        outline:
          'border border-border-strong bg-surface text-fg hover:border-transparent hover:bg-soft hover:text-soft-fg',
        ghost:
          'border border-transparent bg-surface-muted text-fg-muted hover:border-transparent hover:bg-soft hover:text-soft-fg',
        danger:
          'bg-danger text-primary-fg hover:opacity-90 before:hidden [--ripple-color:var(--primary-fg)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-sm',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { buttonVariants };
