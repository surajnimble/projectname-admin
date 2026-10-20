'use client';

import { useCallback, useRef, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function useRipple(speed = 0.47) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const durationMs = Math.round(speed * 1000);

  const addRipple = useCallback(
    (event: React.MouseEvent | React.TouchEvent, currentTarget: HTMLElement) => {
      const rect = currentTarget.getBoundingClientRect();

      const clientX =
        event.type === 'touchstart'
          ? (event as React.TouchEvent).touches[0]?.clientX ??
            (event as React.MouseEvent).clientX
          : (event as React.MouseEvent).clientX;
      const clientY =
        event.type === 'touchstart'
          ? (event as React.TouchEvent).touches[0]?.clientY ??
            (event as React.MouseEvent).clientY
          : (event as React.MouseEvent).clientY;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const size = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * 2;

      const id = nextId.current++;

      setRipples((prev) => [...prev, { id, x, y, size }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, durationMs);
    },
    [durationMs],
  );

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return { ripples, addRipple, clearRipples };
}
