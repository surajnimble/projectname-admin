'use client';

import { useEffect } from 'react';

export function HoverStyleProvider() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'hover-style';
    document.head.appendChild(style);

    const update = () => {
      const root = document.documentElement;
      const color = getComputedStyle(root).getPropertyValue('--hover-color').trim() || 'var(--primary)';
      const opacity = getComputedStyle(root).getPropertyValue('--hover-opacity').trim() || '0.1';

      style.textContent = `
        [data-hover-color]:hover {
          background-color: ${color};
          opacity: ${opacity};
        }
      `;
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      observer.disconnect();
      style.remove();
    };
  }, []);

  return null;
}
