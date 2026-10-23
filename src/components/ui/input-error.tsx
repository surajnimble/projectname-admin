import * as React from 'react';

import { cn } from '@/lib/utils';

function InputError({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="input-error"
      className={cn('text-sm text-destructive', className)}
      {...props}
    />
  );
}

export { InputError };
