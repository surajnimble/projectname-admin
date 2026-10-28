'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  RIPPLE_MAX_SIZE_SCALE,
  RIPPLE_SIZE_REFERENCE_PX,
  RIPPLE_TARGET_SELECTOR,
  TIMING,
} from '@/constants';

interface ActiveRipple {
  pointerId: number | null;
  element: Element;
  layer: HTMLDivElement;
  animationMs: number;
  quickTailMs: number;
  held: boolean;
  fading: boolean;
  origin: { left: number; top: number; width: number; height: number };
  dialog: Element | null;
  fixed: boolean;
  holdTimer?: number;
  exitTimer?: number;
}

const DIALOG_SELECTOR = 'dialog[open], [role="dialog"]:not([data-state="closed"]), [aria-modal="true"]:not([data-state="closed"])';
const resolveTarget = (target: EventTarget | null): Element | null => {
  if (!(target instanceof Element)) return null;

  const element = target.closest(RIPPLE_TARGET_SELECTOR);
  if (!element) return null;
  if (element.getAttribute('data-ripple') === 'off') return null;
  if (element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true') return null;

  return element;
};

interface VisibleClip {
  top: number;
  right: number;
  bottom: number;
  left: number;
  radii: [number, number, number, number];
}

const radiusValue = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const MOVE_TOLERANCE_PX = 2;

const isStale = (ripple: ActiveRipple) => {
  const { element } = ripple;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return true;

  if (
    typeof element.checkVisibility === 'function' &&
    !element.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  ) {
    return true;
  }

  if (!ripple.dialog && typeof document.elementFromPoint === 'function') {
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
    const top = document.elementFromPoint(x, y);
    if (top && !element.contains(top) && !top.contains(element)) return true;
  }

  {
    const { origin, dialog } = ripple;
    let left: number;
    let top: number;
    if (dialog) {
      if (!dialog.isConnected) return true;
      const box = dialog.getBoundingClientRect();
      left = rect.left - box.left;
      top = rect.top - box.top;
    } else {
      left = rect.left + (ripple.fixed ? 0 : window.scrollX);
      top = rect.top + (ripple.fixed ? 0 : window.scrollY);
    }
    if (
      Math.abs(left - origin.left) > MOVE_TOLERANCE_PX ||
      Math.abs(top - origin.top) > MOVE_TOLERANCE_PX ||
      Math.abs(rect.width - origin.width) > MOVE_TOLERANCE_PX ||
      Math.abs(rect.height - origin.height) > MOVE_TOLERANCE_PX
    ) {
      return true;
    }
  }

  return false;
};

const visibleClip = (element: Element, rect: DOMRect): VisibleClip => {
  let clip = { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom };
  const radii: [number, number, number, number] = [0, 0, 0, 0];
  let parent = element.parentElement;

  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent);
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
      const box = parent.getBoundingClientRect();
      const flushTop = rect.top <= box.top + 1;
      const flushRight = rect.right >= box.right - 1;
      const flushBottom = rect.bottom >= box.bottom - 1;
      const flushLeft = rect.left <= box.left + 1;

      if (flushTop && flushLeft) {
        radii[0] = Math.max(radii[0], radiusValue(style.borderTopLeftRadius));
      }
      if (flushTop && flushRight) {
        radii[1] = Math.max(radii[1], radiusValue(style.borderTopRightRadius));
      }
      if (flushBottom && flushRight) {
        radii[2] = Math.max(radii[2], radiusValue(style.borderBottomRightRadius));
      }
      if (flushBottom && flushLeft) {
        radii[3] = Math.max(radii[3], radiusValue(style.borderBottomLeftRadius));
      }

      clip = {
        top: Math.max(clip.top, box.top),
        left: Math.max(clip.left, box.left),
        right: Math.min(clip.right, box.right),
        bottom: Math.min(clip.bottom, box.bottom),
      };
    }
    parent = parent.parentElement;
  }

  return {
    top: Math.max(0, clip.top - rect.top),
    right: Math.max(0, rect.right - clip.right),
    bottom: Math.max(0, rect.bottom - clip.bottom),
    left: Math.max(0, clip.left - rect.left),
    radii,
  };
};

export function RippleProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    const active = new Map<number, ActiveRipple>();
    const ripples = new Set<ActiveRipple>();
    let frame = 0;

    const remove = (ripple: ActiveRipple) => {
      window.clearTimeout(ripple.holdTimer);
      window.clearTimeout(ripple.exitTimer);
      ripple.layer.remove();
      ripples.delete(ripple);
      if (ripple.pointerId !== null && active.get(ripple.pointerId) === ripple) {
        active.delete(ripple.pointerId);
      }
    };

    const prune = () => {
      const openDialog = document.querySelector(DIALOG_SELECTOR);

      ripples.forEach((ripple) => {
        if (!ripple.element.isConnected) {
          remove(ripple);
          return;
        }

        const style = window.getComputedStyle(ripple.element);
        const coveredByDialog =
          openDialog !== null &&
          !openDialog.contains(ripple.element) &&
          ripple.layer.parentElement !== openDialog;

        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          coveredByDialog ||
          isStale(ripple)
        ) {
          remove(ripple);
        }
      });
    };

    const watch = () => {
      frame = 0;
      prune();
      if (ripples.size > 0) frame = window.requestAnimationFrame(watch);
    };

    const ensureWatch = () => {
      if (!frame && ripples.size > 0) frame = window.requestAnimationFrame(watch);
    };

    const fade = (ripple: ActiveRipple, fadeMs: number) => {
      if (ripple.fading) return;
      ripple.fading = true;
      window.clearTimeout(ripple.holdTimer);
      window.clearTimeout(ripple.exitTimer);
      ripple.layer.style.transitionDuration = `${fadeMs}ms`;
      ripple.layer.classList.remove('opacity-100');
      ripple.layer.classList.add('opacity-0');

      ripple.exitTimer = window.setTimeout(() => remove(ripple), fadeMs);
    };

    const accelerate = (ripple: ActiveRipple) => {
      const inner = ripple.layer.firstElementChild;
      const animation =
        inner && typeof inner.getAnimations === 'function' ? inner.getAnimations()[0] : undefined;

      if (
        animation &&
        typeof animation.updatePlaybackRate === 'function' &&
        animation.playState !== 'finished'
      ) {
        const current = typeof animation.currentTime === 'number' ? animation.currentTime : 0;
        const remaining = Math.max(0, ripple.animationMs - current);
        animation.updatePlaybackRate(Math.max(1, remaining / ripple.quickTailMs));
      }

      window.clearTimeout(ripple.exitTimer);
      ripple.exitTimer = window.setTimeout(
        () => fade(ripple, TIMING.rippleClickFadeMs),
        ripple.quickTailMs,
      );
    };

    const release = (ripple: ActiveRipple, cancelled: boolean) => {
      window.clearTimeout(ripple.holdTimer);

      if (cancelled || ripple.held) {
        fade(ripple, ripple.held ? TIMING.ripplePressFadeMs : TIMING.rippleClickFadeMs);
        return;
      }

      accelerate(ripple);
    };

    const start = (
      element: Element,
      clientX: number,
      clientY: number,
      pointerId: number | null,
      mode: 'press' | 'click',
    ) => {
      const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (media?.matches) return;

      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const style = window.getComputedStyle(element);
      const dialog = element.closest(DIALOG_SELECTOR);
      const fixed = style.position === 'fixed' || style.position === 'sticky';
      const radius = style.borderRadius || '0px';
      const sizeScale = Math.min(
        RIPPLE_MAX_SIZE_SCALE,
        Math.max(1, Math.max(rect.width, rect.height) / RIPPLE_SIZE_REFERENCE_PX),
      );
      const duration =
        mode === 'press'
          ? Math.round(TIMING.ripplePressMs * sizeScale)
          : Math.round(TIMING.rippleClickMs * sizeScale);
      const quickTailMs = Math.round(TIMING.rippleClickTailMs * sizeScale);

      const layer = document.createElement('div');
      layer.setAttribute('data-ripple-layer', '');
      layer.setAttribute('aria-hidden', 'true');
      layer.className =
        'pointer-events-none overflow-hidden opacity-100 transition-opacity ease-(--ease-standard)';

      let layerLeft: string;
      let layerTop: string;
      let layerPosition: 'fixed' | 'absolute' = fixed ? 'fixed' : 'absolute';

      if (dialog !== null) {
        const dialogRect = dialog.getBoundingClientRect();
        layerPosition = 'absolute';
        layerLeft = `${rect.left - dialogRect.left}px`;
        layerTop = `${rect.top - dialogRect.top}px`;
        layer.style.zIndex = 'calc(var(--z-modal) + 2)';
      } else {
        layerLeft = `${rect.left + (fixed ? 0 : window.scrollX)}px`;
        layerTop = `${rect.top + (fixed ? 0 : window.scrollY)}px`;
        layer.style.zIndex = 'calc(var(--z-toast) + 1)';
      }

      layer.style.position = layerPosition;
      layer.style.left = layerLeft;
      layer.style.top = layerTop;
      layer.style.width = `${rect.width}px`;
      layer.style.height = `${rect.height}px`;
      layer.style.borderRadius = radius;
      layer.style.color = style.getPropertyValue('--ripple-color').trim() || 'var(--primary)';

      const { top, right, bottom, left, radii } = visibleClip(element, rect);
      if (top || right || bottom || left || radii.some(Boolean)) {
        layer.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radii[0]}px ${radii[1]}px ${radii[2]}px ${radii[3]}px)`;
      }

      const size = Math.max(rect.width, rect.height) * 2;
      const inner = document.createElement('span');
      inner.className = 'animate-ripple absolute block rounded-full bg-current';
      inner.style.width = `${size}px`;
      inner.style.height = `${size}px`;
      inner.style.left = `${clientX - rect.left - size / 2}px`;
      inner.style.top = `${clientY - rect.top - size / 2}px`;
      inner.style.animationDuration = `${duration}ms`;
      layer.appendChild(inner);

      (dialog ?? document.body).appendChild(layer);

      const ripple: ActiveRipple = {
        pointerId,
        element,
        layer,
        animationMs: duration,
        quickTailMs,
        held: false,
        fading: false,
        fixed,
        dialog,
        origin: dialog
          ? {
              left: rect.left - dialog.getBoundingClientRect().left,
              top: rect.top - dialog.getBoundingClientRect().top,
              width: rect.width,
              height: rect.height,
            }
          : {
              left: rect.left + (fixed ? 0 : window.scrollX),
              top: rect.top + (fixed ? 0 : window.scrollY),
              width: rect.width,
              height: rect.height,
            },
      };
      ripples.add(ripple);
      ensureWatch();

      if (pointerId === null) {
        ripple.exitTimer = window.setTimeout(
          () => fade(ripple, TIMING.rippleClickFadeMs),
          duration,
        );
        return;
      }

      active.set(pointerId, ripple);
      ripple.holdTimer = window.setTimeout(() => {
        ripple.held = true;
      }, TIMING.rippleHoldDelayMs);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      prune();
      const element = resolveTarget(event.target);
      if (!element) return;

      const previous = active.get(event.pointerId);
      if (previous) {
        active.delete(event.pointerId);
        fade(previous, TIMING.rippleClickFadeMs);
      }

      start(element, event.clientX, event.clientY, event.pointerId, 'press');
    };

    const onPointerUp = (event: PointerEvent) => {
      prune();
      const ripple = active.get(event.pointerId);
      if (!ripple) return;

      active.delete(event.pointerId);
      release(ripple, event.type === 'pointercancel');
    };

    const onClick = (event: MouseEvent) => {
      ensureWatch();
      if (event.detail !== 0) return;

      const element = resolveTarget(event.target);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      start(element, rect.left + rect.width / 2, rect.top + rect.height / 2, null, 'click');
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('pointercancel', onPointerUp, true);
      document.removeEventListener('click', onClick, true);

      if (frame) window.cancelAnimationFrame(frame);
      ripples.forEach(remove);
      active.clear();
    };
  }, [routeKey]);

  return null;
}
