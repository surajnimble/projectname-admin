'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { useRipple } from '@/hooks/use-ripple';

interface RippleElementProps {
  className?: string;
  style?: React.CSSProperties;
}

function RippleElement({
  className,
  style,
  ...props
}: RippleElementProps & { id: number; x: number; y: number; size: number }) {
  const { id, x, y, size } = props;

  return (
    <span
      data-ripple
      key={id}
      className={cn(
        'pointer-events-none absolute top-0 left-0 rounded-full',
        'bg-[var(--ripple-color)] opacity-[var(--ripple-opacity)]',
        'transition-transform duration-[var(--ripple-speed)] ease-out',
        'transform translate(-50%,-50%) scale(0)',
        className,
      )}
      style={{
        ...style,
        width: size,
        height: size,
        left: `calc(${x}px - ${size / 2}px)`,
        top: `calc(${y}px - ${size / 2}px)`,
      }}
    />
  );
}

interface RippleProps extends React.ComponentProps<'div'> {
  disabled?: boolean;
}

function Ripple({
  className,
  disabled,
  children,
  ...props
}: RippleProps & { children: React.ReactNode }) {
  const { ripples, addRipple, clearRipples } = useRipple();

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    addRipple(event, event.currentTarget as HTMLElement);
  };

  const handleMouseUp = () => {
    clearRipples();
  };

  const handleMouseLeave = () => {
    clearRipples();
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled) return;
    addRipple(event, event.currentTarget as HTMLElement);
  };

  const handleTouchEnd = () => {
    clearRipples();
  };

  return (
    <div
      data-slot="ripple"
      className={cn(
        'relative isolate rounded-md select-none',
        'before:pointer-events-none before:absolute before:inset-0 before:content-[""]',
        className,
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
      {ripples.map((r: { id: number; x: number; y: number; size: number }) => (
        <RippleElement key={r.id} id={r.id} x={r.x} y={r.y} size={r.size} />
      ))}
    </div>
  );
}

export { Ripple };
