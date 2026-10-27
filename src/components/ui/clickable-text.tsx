'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

const clickableTextVariants = cva(
  'cursor-pointer rounded-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/80 hover:underline underline-offset-4',
        muted:   'text-muted-foreground hover:text-foreground hover:underline underline-offset-4',
        danger:  'text-destructive hover:text-destructive/80 hover:underline underline-offset-4',
        nav: [
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
          'text-muted-foreground hover:bg-hover hover:text-foreground',
        ],
      },
      active: {
        true:  '',
        false: '',
      },
      size: {
        sm:      'text-xs',
        default: 'text-sm',
        lg:      'text-base',
      },
    },
    compoundVariants: [
      {
        variant: 'nav',
        active:  true,
        className: 'bg-nav-active text-nav-active-fg font-semibold hover:bg-nav-active hover:text-nav-active-fg',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size:    'default',
      active:  false,
    },
  },
);

type CVAProps = VariantProps<typeof clickableTextVariants>;

interface SharedProps extends CVAProps {
  className?: string;
  children?: React.ReactNode;
}

interface AsLinkProps extends SharedProps, Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'> {
  href: string;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

interface AsButtonProps extends SharedProps, Omit<React.ComponentProps<'button'>, 'type' | 'className' | 'children'> {
  href?: never;
  external?: never;
}

export type ClickableTextProps = AsLinkProps | AsButtonProps;

function ClickableText({
  variant,
  size,
  active,
  className,
  children,
  ...props
}: ClickableTextProps) {
  const classes = cn(clickableTextVariants({ variant, size, active }), className);

  if ('href' in props && props.href !== undefined) {
    const { href, external, ...rest } = props as AsLinkProps;
    return (
      <Link
        href={href}
        className={classes}
        data-ripple
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      data-ripple
      {...(props as AsButtonProps)}
    >
      {children}
    </button>
  );
}

export { ClickableText, clickableTextVariants };
