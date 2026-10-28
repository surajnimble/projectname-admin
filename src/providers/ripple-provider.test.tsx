import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TIMING } from '@/constants';
import { RippleProvider } from './ripple-provider';

const route = vi.hoisted(() => ({ pathname: '/', search: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.search),
}));

const rect = (overrides: Partial<DOMRect> = {}): DOMRect => ({
  x: 0,
  y: 0,
  width: 100,
  height: 40,
  top: 0,
  left: 0,
  right: 100,
  bottom: 40,
  toJSON: () => ({}),
  ...overrides,
});

const layer = () => document.querySelector<HTMLElement>('[data-ripple-layer]');

const renderButton = () => {
  const view = render(
    <>
      <RippleProvider />
      <button type="button">Save</button>
    </>,
  );
  const button = screen.getByRole('button', { name: 'Save' });
  vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(rect());

  return { ...view, button };
};

describe('RippleProvider', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    cleanup();
    route.pathname = '/';
    route.search = '';
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('holds the ripple while pressed, then fades and removes it', () => {
    const { button } = renderButton();

    fireEvent.pointerDown(button, { button: 0, clientX: 20, clientY: 10, pointerId: 1 });

    const ripple = layer();
    expect(ripple).not.toBeNull();
    expect(ripple).toHaveClass('opacity-100');

    vi.advanceTimersByTime(TIMING.rippleHoldDelayMs);
    expect(layer()).toBe(ripple);
    expect(ripple).toHaveClass('opacity-100');

    fireEvent.pointerUp(button, { pointerId: 1 });
    expect(ripple).toHaveClass('opacity-0');

    vi.advanceTimersByTime(TIMING.ripplePressFadeMs);
    expect(layer()).toBeNull();
  });

  it('finishes a quick click before fading it', () => {
    const { button } = renderButton();

    fireEvent.pointerDown(button, { button: 0, clientX: 20, clientY: 10, pointerId: 1 });
    const ripple = layer();
    fireEvent.pointerUp(button, { pointerId: 1 });

    expect(ripple).toHaveClass('opacity-100');

    vi.advanceTimersByTime(TIMING.rippleClickTailMs - 1);
    expect(ripple).toHaveClass('opacity-100');

    vi.advanceTimersByTime(1);
    expect(ripple).toHaveClass('opacity-0');

    vi.advanceTimersByTime(TIMING.rippleClickFadeMs);
    expect(layer()).toBeNull();
  });

  it('uses the brand colour by default and the variant colour when provided', () => {
    const { button } = renderButton();

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    expect(layer()?.style.color).toBe('var(--primary)');

    cleanup();
    render(
      <>
        <RippleProvider />
        <button type="button">Save</button>
      </>,
    );

    const coloured = screen.getByRole('button', { name: 'Save' });
    coloured.style.setProperty('--ripple-color', 'var(--primary-fg)');
    vi.spyOn(coloured, 'getBoundingClientRect').mockReturnValue(rect());
    fireEvent.pointerDown(coloured, { button: 0, pointerId: 2 });

    expect(layer()?.style.color).toBe('var(--primary-fg)');
  });

  it('removes the ripple when its target leaves the document', () => {
    render(<RippleProvider />);

    const button = document.createElement('button');
    button.type = 'button';
    document.body.appendChild(button);
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(rect());

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    expect(layer()).not.toBeNull();

    button.remove();
    fireEvent.pointerUp(document.body, { pointerId: 1 });

    expect(layer()).toBeNull();
  });

  it('applies to non-semantic clickables marked with data-ripple', () => {
    render(
      <>
        <RippleProvider />
        <table>
          <tbody>
            <tr data-ripple="">
              <td>
                <span>Row</span>
              </td>
            </tr>
          </tbody>
        </table>
      </>,
    );

    const row = screen.getByText('Row').closest('tr');
    expect(row).not.toBeNull();
    if (!row) return;
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(rect());

    fireEvent.pointerDown(screen.getByText('Row'), { button: 0, pointerId: 1 });

    expect(layer()).not.toBeNull();
  });

  it('clips the layer to a rounded, overflowing ancestor', () => {
    render(
      <>
        <RippleProvider />
        <div
          data-testid="card"
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            borderBottomRightRadius: '16px',
            borderBottomLeftRadius: '16px',
          }}
        >
          <button type="button">Open</button>
        </div>
      </>,
    );

    const button = screen.getByRole('button', { name: 'Open' });
    const card = screen.getByTestId('card');
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(rect());
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(rect());

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });

    expect(layer()?.style.clipPath).toContain('round 16px');
  });

  it('adds a centered ripple for keyboard activation', () => {
    const { button } = renderButton();

    fireEvent.click(button, { detail: 0 });

    const ripple = layer();
    expect(ripple).not.toBeNull();

    vi.advanceTimersByTime(TIMING.rippleClickMs);
    expect(ripple).toHaveClass('opacity-0');

    vi.advanceTimersByTime(TIMING.rippleClickFadeMs);
    expect(layer()).toBeNull();
  });

  it('removes the ripple when its button is hidden by an ancestor', () => {
    const { button } = renderButton();

    fireEvent.pointerDown(button, { button: 0, clientX: 20, clientY: 10, pointerId: 1 });
    expect(layer()).not.toBeNull();

    // An ancestor getting display:none gives the button a zero-size box.
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      rect({ width: 0, height: 0, right: 0, bottom: 0 }),
    );
    vi.advanceTimersByTime(50);

    expect(layer()).toBeNull();
  });

  it('removes the ripple when its button moves away from where it was pressed', () => {
    const { button } = renderButton();

    fireEvent.pointerDown(button, { button: 0, clientX: 20, clientY: 10, pointerId: 1 });
    expect(layer()).not.toBeNull();

    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      rect({ top: 120, bottom: 160, y: 120 }),
    );
    vi.advanceTimersByTime(50);

    expect(layer()).toBeNull();
  });

  it('removes ripples when the route changes', () => {
    const { button, rerender } = renderButton();

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    expect(layer()).not.toBeNull();

    route.pathname = '/vendors';
    rerender(
      <>
        <RippleProvider />
        <button type="button">Save</button>
      </>,
    );

    expect(layer()).toBeNull();
  });

  it('removes ripples when only the query changes', () => {
    const { button, rerender } = renderButton();

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    expect(layer()).not.toBeNull();

    route.search = '?page=2';
    rerender(
      <>
        <RippleProvider />
        <button type="button">Save</button>
      </>,
    );

    expect(layer()).toBeNull();
  });

  it('skips disabled controls and opt-outs', () => {
    render(
      <>
        <RippleProvider />
        <button type="button" disabled>
          Disabled
        </button>
        <button type="button" aria-disabled="true">
          Unavailable
        </button>
        <button type="button" data-ripple="off">
          Opt out
        </button>
      </>,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Disabled' }), { pointerId: 1 });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Unavailable' }), { pointerId: 2 });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Opt out' }), { pointerId: 3 });

    expect(layer()).toBeNull();
  });

  it('does not animate when reduced motion is preferred', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    const { button } = renderButton();

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });

    expect(layer()).toBeNull();
  });
});
