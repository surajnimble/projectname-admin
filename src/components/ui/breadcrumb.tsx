import * as React from 'react';
import { ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Breadcrumb({
  className,
  ...props
}: React.ComponentProps<'nav'> & { className?: string }) {
  return (
    <nav
      data-slot="breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 sm:gap-2', className)}
      {...props}
    />
  );
}

function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<'ol'> & { className?: string }) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1 sm:gap-2',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<'li'> & { className?: string }) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('flex items-center gap-1 sm:gap-2', className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  className,
  ...props
}: React.ComponentProps<'a'> & { className?: string }) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        'underline-offset-4 hover:underline text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  className,
  ...props
}: React.ComponentProps<'li'> & { className?: string }) {
  return (
    <li
      data-slot="breadcrumb-separator"
      className={cn(
        'flex size-3.5 shrink-0 items-center justify-center text-muted-foreground',
        className,
      )}
      {...props}
    >
      <ChevronRightIcon />
    </li>
  );
}

function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<'span'> & { className?: string }) {
  return (
    <span
      data-slot="breadcrumb-page"
      className={cn(
        'text-sm text-muted-foreground data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
