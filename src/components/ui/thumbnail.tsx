'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThumbnailProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}

export function Thumbnail({ src, alt, className, fallback }: ThumbnailProps) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'bg-primary-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
          className,
        )}
      >
        {fallback ?? alt.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      unoptimized
      className={cn('size-10 shrink-0 rounded-lg object-cover', className)}
    />
  );
}
