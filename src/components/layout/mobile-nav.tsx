'use client';

import { PanelLeftClose } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/messages';
import { Sidebar } from './sidebar';

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-(--z-modal) lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={MESSAGES.common.closeSidebar}
        data-ripple="off"
        className="bg-overlay absolute inset-0"
        onClick={onClose}
      />
      <div className="bg-surface relative h-full w-64 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3"
          aria-label={MESSAGES.common.closeSidebar}
          onClick={onClose}
        >
          <PanelLeftClose className="size-5" aria-hidden="true" />
        </Button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
