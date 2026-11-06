'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  triggerClassName?: string;
  width?: number;
  height?: number;
}

/** A reusable, keyboard-accessible image trigger with a full-size preview. */
export function ImagePreview({
  src,
  alt,
  className,
  triggerClassName,
  width = 640,
  height = 640,
}: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        className={cn(
          'group relative inline-flex max-w-full overflow-hidden rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          triggerClassName,
        )}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label={`View full image: ${alt || 'image'}`}
        title="View full image"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className={cn('max-w-full object-cover', className)}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-overlay/0 text-fg-inverse opacity-0 transition group-hover:bg-overlay/35 group-hover:opacity-100 group-focus-visible:bg-overlay/35 group-focus-visible:opacity-100">
          <Eye className="size-5" aria-hidden="true" />
        </span>
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={alt || 'Image preview'}
        size="full"
        closeLabel="Close image preview"
      >
        <div className="flex max-h-preview-dialog min-h-0 items-center justify-center overflow-auto">
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1440}
            unoptimized
            className="max-h-preview-image w-auto max-w-full rounded-md object-contain"
          />
        </div>
      </Dialog>
    </>
  );
}
