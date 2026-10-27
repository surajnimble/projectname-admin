'use client';

import { MoreVertical, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';

export interface OptionsMenuItem {
  label: string;
  icon?: LucideIcon;
  intent?: 'default' | 'danger';
  active?: boolean;
  onSelect: () => void;
}

interface OptionsMenuProps {
  label: string;
  items: OptionsMenuItem[];
  className?: string;
  triggerIcon?: LucideIcon;
}

export function OptionsMenu({
  label,
  items,
  className,
  triggerIcon,
}: OptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const TriggerIcon = triggerIcon ?? MoreVertical;

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
    const below = rect.bottom + 4;
    const top =
      below + height > window.innerHeight - 8
        ? Math.max(8, rect.top - height - 4)
        : below;

    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const swallowNextClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      document.removeEventListener('click', swallowNextClick, true);
    };

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
      document.addEventListener('click', swallowNextClick, true);
      window.setTimeout(
        () => document.removeEventListener('click', swallowNextClick, true),
        500,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn('relative', className)}>
      <IconButton
        ref={triggerRef}
        icon={<TriggerIcon className="size-4" aria-hidden="true" />}
        label={label}
        variant="ghost"
        size="icon-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={{ top: position.top, left: position.left }}
            className="bg-background border-border fixed z-50 flex w-48 flex-col gap-0.5 rounded-md border p-1 shadow-md"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors',
                  item.intent === 'danger'
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground data-hover-color hover:bg-hover',
                )}
              >
                {item.icon && <item.icon className="size-4" aria-hidden="true" />}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
