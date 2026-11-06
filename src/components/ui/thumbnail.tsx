'use client';

import { ImagePreview } from '@/components/common/image-preview';
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
          'bg-surface-muted/60 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-sm font-semibold',
          className,
        )}
      >
        {fallback ?? alt.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <ImagePreview
      src={src}
      alt={alt}
      width={40}
      height={40}
      triggerClassName={cn('size-10 shrink-0', className)}
      className="size-full rounded-lg object-cover"
    />
  );
}
