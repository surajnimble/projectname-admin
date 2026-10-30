'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableMediaProps {
  /** Image sources, rendered as an overlapping stack. */
  sources: readonly string[];
  alt: string;
  /** Shown when there is no image. */
  fallback?: ReactNode;
  /** How many images to show before the overflow counter. */
  max?: number;
}

/** Overlapping media stack, e.g. a product gallery with a "+2" counter. */
export function DataTableMedia({ sources, alt, fallback, max = 3 }: DataTableMediaProps) {
  const images = sources.filter(Boolean).slice(0, max);
  const overflow = sources.filter(Boolean).length - images.length;

  if (images.length === 0) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'bg-surface-muted/60 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-sm font-semibold',
        )}
      >
        {fallback ?? alt.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center">
      {images.map((source, index) => (
        <Image
          key={`${source}-${index}`}
          src={source}
          alt={index === 0 ? alt : ''}
          width={40}
          height={40}
          unoptimized
          className={cn(
            'bg-surface-muted size-10 rounded-lg border border-border object-cover',
            index > 0 && '-ml-3 ring-2 ring-background',
          )}
          style={{ zIndex: images.length - index }}
        />
      ))}
      {overflow > 0 && (
        <span className="bg-surface-muted text-fg-muted -ml-3 flex size-10 items-center justify-center rounded-lg border border-border text-xs font-medium ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </span>
  );
}

interface DataTableIdentityProps {
  title: string;
  /** Secondary line under the title. */
  meta?: ReactNode;
  /** Renders the title as a link. */
  href?: string;
  className?: string;
}

/** Title + secondary line, used as the first cell of a row. */
export function DataTableIdentity({ title, meta, href, className }: DataTableIdentityProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      {href ? (
        <Link
          href={href}
          onClick={(event) => event.stopPropagation()}
          className="text-primary block max-w-40 truncate font-medium hover:underline sm:max-w-56 lg:max-w-none"
        >
          {title}
        </Link>
      ) : (
        <span className="block max-w-40 truncate font-medium sm:max-w-56 lg:max-w-none">
          {title}
        </span>
      )}
      {meta && (
        <span className="text-fg-muted block max-w-40 truncate text-xs sm:max-w-56 lg:max-w-none">
          {meta}
        </span>
      )}
    </div>
  );
}
