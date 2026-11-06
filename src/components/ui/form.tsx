'use client';

import { createContext, useContext, useId, type ComponentProps, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormContextValue { id: string }
const FormContext = createContext<FormContextValue | null>(null);

export function Form({ className, children, ...props }: ComponentProps<'form'>) {
  return <form className={cn('flex flex-col gap-4', className)} {...props}>{children}</form>;
}

export function FormField({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const id = useId();
  return <FormContext.Provider value={{ id }}><div className={cn('flex flex-col gap-2', className)} {...props}>{children}</div></FormContext.Provider>;
}

export function FormItem({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props}>{children}</div>;
}

export function FormLabel({ className, htmlFor, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  const context = useContext(FormContext);
  return <Label htmlFor={htmlFor ?? context?.id} className={className} {...props} />;
}

export function FormControl({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={cn('min-w-0', className)} {...props}>{children}</div>;
}

export function FormDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-fg-muted', className)} {...props} />;
}

export function FormMessage({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p role="alert" className={cn('text-sm text-danger', className)} {...props} />;
}
