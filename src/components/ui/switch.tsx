import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface SwitchProps {
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  size?: 'default' | 'lg';
  label?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  checked?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  'aria-label'?: string;
}

function Switch({
  className,
  checkedIcon,
  uncheckedIcon,
  size = 'default',
  label,
  onChange,
  checked,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <div className={cn('flex items-center gap-2', label && 'text-sm text-foreground')}>
      <SwitchPrimitive.Root
        data-slot="switch"
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input data-[state=checked]:hover:bg-primary/90 dark:data-[state=unchecked]:bg-input/80',
          size === 'default' ? 'h-[1.15rem] w-8' : 'h-6 w-11',
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            'group/thumb pointer-events-none relative flex items-center justify-center rounded-full bg-background shadow-xs ring-0 transition-transform dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
            size === 'default'
              ? 'size-4 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:-translate-x-[calc(100%-2px)] rtl:data-[state=unchecked]:translate-x-0'
              : 'size-[18px] data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-[2px] rtl:data-[state=checked]:-translate-x-[24px] rtl:data-[state=unchecked]:-translate-x-[2px]',
          )}
        >
          {uncheckedIcon && (
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-data-[state=checked]/thumb:opacity-0 group-data-[state=unchecked]/thumb:opacity-100">
              {uncheckedIcon}
            </span>
          )}
          {checkedIcon && (
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-data-[state=checked]/thumb:opacity-100 group-data-[state=unchecked]/thumb:opacity-0">
              {checkedIcon}
            </span>
          )}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </div>
  );
}

export { Switch };
