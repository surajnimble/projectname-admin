import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia, which the responsive table layout reads to
// pick between the table and the stacked card layout. Default to a desktop viewport.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  const VIEWPORT_WIDTH = 1280;

  const toPixels = (match: RegExpExecArray | null) => {
    if (!match) return null;
    const value = Number.parseFloat(match[1] ?? '0');
    return match[2] === 'rem' ? value * 16 : value;
  };

  window.matchMedia = ((query: string) => {
    const min = toPixels(/min-width:\s*([\d.]+)(rem|px)/.exec(query));
    const max = toPixels(/max-width:\s*([\d.]+)(rem|px)/.exec(query));

    let matches = true;
    if (min !== null) matches = matches && VIEWPORT_WIDTH >= min;
    if (max !== null) matches = matches && VIEWPORT_WIDTH <= max;
    if (query.includes('prefers-reduced-motion')) matches = false;

    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }) as typeof window.matchMedia;
}

// jsdom does not implement the modal dialog methods, so the native <dialog> primitive
// needs a small stand-in for the component tests.
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
}
