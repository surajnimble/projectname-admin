import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type IconSize = 'icon-sm' | 'icon' | 'icon-lg';

export interface IconButtonProps
  extends Omit<React.ComponentProps<'button'>, 'children'>, Omit<VariantProps<typeof buttonVariants>, 'size'> {
  icon: React.ReactNode;
  label: string;
  tooltip?: boolean;
  loading?: boolean;
  size?: IconSize;
}

function IconButton({
  icon,
  label,
  tooltip = false,
  variant = 'ghost',
  size = 'icon',
  className,
  loading,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      loading={loading}
      className={cn(className)}
      {...props}
    >
      {icon}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { IconButton };
