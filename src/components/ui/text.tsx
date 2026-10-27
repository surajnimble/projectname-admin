import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-bold tracking-tight text-foreground',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight text-foreground',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight text-foreground',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight text-foreground',
      bodyLg: 'text-base leading-relaxed text-foreground',
      body:   'text-sm leading-relaxed text-foreground',
      bodySm: 'text-xs leading-relaxed text-foreground',
      label:   'text-sm font-medium leading-none text-foreground',
      caption: 'text-xs text-muted-foreground',
      muted:   'text-sm text-muted-foreground',
      helper:  'text-xs text-muted-foreground',
      code:    'font-mono text-sm rounded bg-muted px-1.5 py-0.5',
      pageTitle:    'text-2xl font-bold tracking-tight text-foreground',
      sectionTitle: 'text-lg font-semibold text-foreground',
    },
    truncate: {
      true: 'truncate',
    },
    clamp: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
    },
    weight: {
      normal:    'font-normal',
      medium:    'font-medium',
      semibold:  'font-semibold',
      bold:      'font-bold',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

const DEFAULT_ELEMENT: Record<string, React.ElementType> = {
  h1:           'h1',
  h2:           'h2',
  h3:           'h3',
  h4:           'h4',
  bodyLg:       'p',
  body:         'p',
  bodySm:       'p',
  label:        'span',
  caption:      'span',
  muted:        'span',
  helper:       'span',
  code:         'code',
  pageTitle:    'h1',
  sectionTitle: 'h2',
};

type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>;

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: React.ElementType;
  truncate?: boolean;
  clamp?: 1 | 2 | 3;
  weight?: VariantProps<typeof textVariants>['weight'];
}

function Text({
  variant = 'body',
  as,
  className,
  truncate,
  clamp,
  weight,
  ...props
}: TextProps) {
  const Comp = as ?? DEFAULT_ELEMENT[variant] ?? 'span';
  return (
    <Comp
      className={cn(textVariants({ variant, truncate, clamp, weight }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
