'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string;
}

export function Avatar({ src, name, className }: AvatarProps) {
  const label = (name ?? '').trim();

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'bg-soft text-soft-fg flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          className,
        )}
      >
        {label.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={label}
      width={40}
      height={40}
      unoptimized
      className={cn('size-10 shrink-0 rounded-full object-cover', className)}
    />
  );
}
