'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/messages';
import type { ReactNode } from 'react';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<unknown>;
  isRefreshing?: boolean;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'default';
  children?: ReactNode;
}

/** Shared refresh action used by page headers, tables and detail panels. */
export function RefreshButton({
  onRefresh,
  isRefreshing = false,
  label = MESSAGES.dashboard.refresh,
  disabled = false,
  size = 'sm',
  children,
}: RefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      loading={isRefreshing}
      disabled={disabled || isRefreshing}
      onClick={() => void onRefresh()}
      className="shrink-0"
      aria-label={label}
    >
      <RefreshCw className="size-4" aria-hidden="true" />
      {children ?? label}
    </Button>
  );
}
