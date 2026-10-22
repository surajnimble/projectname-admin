'use client';

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  placement?: 'center' | 'bottom';
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  placement = 'center',
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className="bg-transparent m-0 h-full max-h-none w-full max-w-none border-0 p-0 backdrop:bg-overlay"
    >
      <div
        className={cn(
          'flex min-h-full w-full',
          placement === 'bottom'
            ? 'items-end justify-center sm:items-center sm:p-4'
            : 'items-center justify-center p-4',
        )}
        onClick={handleBackdropClick}
      >
        <div
          className={cn(
            'bg-surface text-fg border-border flex max-h-dvh w-full max-w-lg flex-col overflow-hidden border shadow-lg',
            placement === 'bottom' ? 'rounded-t-xl sm:rounded-lg' : 'rounded-lg',
            className,
          )}
        >
          <div className="border-border flex items-start justify-between gap-4 border-b p-5">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 id={titleId} className="text-base font-semibold break-words">
                {title}
              </h2>
              {description && <p className="text-fg-muted text-sm break-words">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="text-fg-muted hover:text-fg hover:bg-hover -mr-2 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-md"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {children && <div className="flex-1 overflow-y-auto p-5">{children}</div>}
          {footer && (
            <div className="border-border flex flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
