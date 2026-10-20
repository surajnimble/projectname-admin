import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const DIALOG_MAX_WIDTH: Record<DialogSize, string> = {
  sm:   'sm:max-w-sm',
      md:   'sm:max-w-lg',
  lg:   'sm:max-w-2xl',
  xl:   'sm:max-w-4xl',
  full: 'sm:max-w-[calc(100vw-2rem)]',
};

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const CONTENT_BASE =
  'fixed top-[50%] left-[50%] z-[100] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 ' +
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ' +
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95';

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-[100] bg-black/80 ' +
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 ' +
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogContent({
  className,
  size = 'md',
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { size?: DialogSize }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(CONTENT_BASE, DIALOG_MAX_WIDTH[size], className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogCloseButton({ label = 'Close' }: { label?: string }) {
  return (
    <DialogPrimitive.Close
      className={
        "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity " +
        "hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden " +
        "disabled:pointer-events-none data-[state=open]:bg-primary/10 data-[state=open]:text-muted-foreground " +
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      }
      aria-label={label}
    >
      <XIcon />
      <span className="sr-only">{label}</span>
    </DialogPrimitive.Close>
  );
}

export interface DialogProps
  extends React.ComponentProps<typeof DialogPrimitive.Root> {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  closeLabel?: string;
  footer?: React.ReactNode;
  size?: DialogSize;
}

function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel = 'Close',
  footer,
  size = 'md',
  children,
  ...props
}: DialogProps) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && onClose) onClose();
      }}
      {...props}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(CONTENT_BASE, DIALOG_MAX_WIDTH[size])}
        >
          {(title || description) && (
            <DialogHeader>
              {title       && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}

          {children}

          {footer && <DialogFooter>{footer}</DialogFooter>}

          <DialogCloseButton label={closeLabel} />
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

export {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
