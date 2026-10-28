import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground active:bg-primary/80',
        primary:
          'bg-primary text-primary-foreground shadow-sm active:bg-primary/80',
        subtle:
          'bg-primary/10 text-primary active:bg-primary/30',
        destructive:
          'bg-destructive text-destructive-foreground active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        destructiveSubtle:
          'bg-destructive/10 text-destructive-foreground active:bg-destructive/30 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-input bg-transparent shadow-xs active:bg-primary/20 dark:bg-input/30 dark:border-input',
        secondary:
          'bg-secondary text-secondary-foreground active:bg-secondary/90',
        ghost:
          'bg-transparent text-foreground active:bg-primary/20',
        ghostPrimary:
          'text-primary active:bg-primary/20',
        ghostDestructive:
          'text-destructive-foreground active:bg-destructive/20',
        toggle:
          'bg-transparent text-foreground active:bg-primary/20',
        link:
          'text-primary underline-offset-4 active:text-primary/80',
        accent:
          'bg-primary text-primary-foreground active:bg-primary/80 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40',
        muted:
          'bg-muted text-muted-foreground active:bg-muted/90',
        success:
          'bg-success text-success-foreground active:bg-success/80 focus-visible:ring-success/20 dark:focus-visible:ring-success/40',
      },
      size: {
        default:  'h-9 px-4 py-2 has-[>svg]:px-3',
        sm:       'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg:       'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon:     'size-9',
        'icon-sm':'size-8',
        'icon-lg':'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
);

function ButtonComp({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  ripple?: boolean;
  icon?: React.ReactNode;
}

function Button({
  children,
  loading = false,
  ripple = true,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const isLoading = loading;
  const isDisabled = loading || props.disabled;

  if (asChild) {
    return (
      <ButtonComp
        variant={variant}
        size={size}
        className={className}
        asChild
        disabled={isDisabled}
        data-ripple={ripple ? undefined : 'off'}
        data-hover-color
        {...props}
      >
        {children}
      </ButtonComp>
    );
  }

  return (
    <ButtonComp
      variant={variant}
      size={size}
      className={className}
      disabled={isDisabled}
      data-ripple={ripple ? undefined : 'off'}
      data-hover-color
      {...props}
    >
      {isLoading ? (
        <>
          {React.Children.map(children, (child, index) => {
            if (index === 0 && React.isValidElement(child)) {
              const el = child as React.ReactElement<{ className?: string }>;
              return React.cloneElement(el, { className: 'animate-spin' });
            }
            return child;
          })}
        </>
      ) : (
        children
      )}
    </ButtonComp>
  );
}

export { Button, buttonVariants };
