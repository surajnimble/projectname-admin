'use client';

import type { AnchorHTMLAttributes, DetailsHTMLAttributes, HTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NavigationMenu({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav aria-label="Section navigation" className={cn('relative flex min-w-0 items-center', className)} {...props} />;
}

export function NavigationMenuList({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex min-w-0 list-none items-center gap-1', className)} {...props} />;
}

export function NavigationMenuItem({ className, ...props }: DetailsHTMLAttributes<HTMLDetailsElement>) {
  return <details className={cn('group relative', className)} {...props} />;
}

export function NavigationMenuTrigger({ children, className, ...props }: HTMLAttributes<HTMLElement>) {
  return <summary className={cn('flex h-9 cursor-pointer list-none items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden', className)} {...props}>{children}<ChevronDown className="size-3.5 transition-transform group-open:rotate-180" /></summary>;
}

export function NavigationMenuContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute left-0 top-full z-50 mt-1 min-w-48 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg', className)} {...props} />;
}

export function NavigationMenuLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn('flex items-center rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring', className)} {...props} />;
}

export function NavigationMenuIndicator({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={cn('h-1 w-1 rounded-full bg-primary', className)} {...props} />;
}

export function NavigationMenuViewport({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative z-50', className)} {...props} />;
}

export const navigationMenuTriggerStyle = 'flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
