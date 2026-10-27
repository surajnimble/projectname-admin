'use client';

import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';
import { useCallback, useState } from 'react';

export type ThemeMode =
  | 'light'
  | 'dark'
  | 'system'
  | 'luxury'
  | 'retro'
  | 'arctic'
  | 'nature'
  | 'ember'
  | 'dracula'
  | 'midnight';

export type Accent = 'indigo' | 'blue' | 'green' | 'red' | 'orange';

export interface ThemeSettingsState {
  mode: ThemeMode;
  fontSize: number;
  density: number;
  radius: number;
  accent: Accent;
  skeletonColor: string;
  skeletonOpacity: number;
  skeletonSpeed: number;
  rippleColor: string;
  rippleOpacity: number;
  rippleSpeed: number;
  hoverColor: string;
  hoverOpacity: number;
}

const ACCENT_TOKEN: Record<Accent, string> = {
  indigo: 'var(--palette-brand-600)',
  blue: 'var(--palette-blue-600)',
  green: 'var(--palette-green-600)',
  red: 'var(--palette-red-600)',
  orange: 'var(--palette-amber-600)',
};

const THEME_PRIMARY_COLORS: Record<ThemeMode, string> = {
  light: 'var(--palette-brand-600)',
  dark: 'var(--palette-brand-600)',
  system: 'var(--palette-brand-600)',
  luxury: '#c58b3e',
  retro: '#b08968',
  arctic: '#22d3ee',
  nature: '#4ade80',
  ember: '#fb923c',
  dracula: '#bd93f9',
  midnight: '#38bdf8',
};

const DEFAULT_MODE: ThemeMode = 'system';
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_DENSITY = 1;
const DEFAULT_RADIUS = 1;
const DEFAULT_ACCENT: Accent = 'indigo';
const DEFAULT_SKELETON_COLOR = 'var(--muted)';
const DEFAULT_SKELETON_OPACITY = 0.5;
const DEFAULT_SKELETON_SPEED = 1.5;
const DEFAULT_RIPPLE_COLOR = 'var(--primary)';
const DEFAULT_RIPPLE_OPACITY = 0.25;
const DEFAULT_RIPPLE_SPEED = 1;
const DEFAULT_HOVER_COLOR = 'var(--primary)';
const DEFAULT_HOVER_OPACITY = 0.1;

export function useThemeSettings() {
  const { setTheme } = useTheme();
  const mounted = useMounted();
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [fontSize, setFontSizeState] = useState<number>(DEFAULT_FONT_SIZE);
  const [density, setDensityState] = useState<number>(DEFAULT_DENSITY);
  const [radius, setRadiusState] = useState<number>(DEFAULT_RADIUS);
  const [accent, setAccentState] = useState<Accent>(DEFAULT_ACCENT);
  const [skeletonColor, setSkeletonColorState] = useState<string>(DEFAULT_SKELETON_COLOR);
  const [skeletonOpacity, setSkeletonOpacityState] = useState<number>(DEFAULT_SKELETON_OPACITY);
  const [skeletonSpeed, setSkeletonSpeedState] = useState<number>(DEFAULT_SKELETON_SPEED);
  const [rippleColor, setRippleColorState] = useState<string>(DEFAULT_RIPPLE_COLOR);
  const [rippleOpacity, setRippleOpacityState] = useState<number>(DEFAULT_RIPPLE_OPACITY);
  const [rippleSpeed, setRippleSpeedState] = useState<number>(DEFAULT_RIPPLE_SPEED);
  const [hoverColor, setHoverColorState] = useState<string>(DEFAULT_HOVER_COLOR);
  const [hoverOpacity, setHoverOpacityState] = useState<number>(DEFAULT_HOVER_OPACITY);

  const setMode = useCallback(
    (value: ThemeMode) => {
      setModeState(value);
      setTheme(value);
      const primaryColor = THEME_PRIMARY_COLORS[value];
      if (mounted) {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--brand', primaryColor);
      }
    },
    [setTheme, mounted],
  );

  const setFontSize = useCallback(
    (value: number) => {
      setFontSizeState(value);
      if (mounted) {
        document.documentElement.style.fontSize = `${value}px`;
      }
    },
    [mounted],
  );

  const setDensity = useCallback(
    (value: number) => {
      setDensityState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--density', String(value));
      }
    },
    [mounted],
  );

  const setRadius = useCallback(
    (value: number) => {
      setRadiusState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--radius-scale', String(value));
      }
    },
    [mounted],
  );

  const setAccent = useCallback(
    (value: Accent) => {
      setAccentState(value);
      if (mounted) {
        const token = ACCENT_TOKEN[value];
        document.documentElement.style.setProperty('--primary', token);
        document.documentElement.style.setProperty('--brand', token);
      }
    },
    [mounted],
  );

  const setSkeletonColor = useCallback(
    (value: string) => {
      setSkeletonColorState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--skeleton-color', value);
      }
    },
    [mounted],
  );

  const setSkeletonOpacity = useCallback(
    (value: number) => {
      setSkeletonOpacityState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--skeleton-opacity', String(value));
      }
    },
    [mounted],
  );

  const setSkeletonSpeed = useCallback(
    (value: number) => {
      setSkeletonSpeedState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--skeleton-speed', String(value));
      }
    },
    [mounted],
  );

  const setRippleColor = useCallback(
    (value: string) => {
      setRippleColorState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--ripple-color', value);
      }
    },
    [mounted],
  );

  const setRippleOpacity = useCallback(
    (value: number) => {
      setRippleOpacityState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--ripple-opacity', String(value));
      }
    },
    [mounted],
  );

  const setRippleSpeed = useCallback(
    (value: number) => {
      setRippleSpeedState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--ripple-speed', String(value));
      }
    },
    [mounted],
  );

  const setHoverColor = useCallback(
    (value: string) => {
      setHoverColorState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--hover-color', value);
      }
    },
    [mounted],
  );

  const setHoverOpacity = useCallback(
    (value: number) => {
      setHoverOpacityState(value);
      if (mounted) {
        document.documentElement.style.setProperty('--hover-opacity', String(value));
      }
    },
    [mounted],
  );

  const reset = useCallback(() => {
    setModeState(DEFAULT_MODE);
    setFontSizeState(DEFAULT_FONT_SIZE);
    setDensityState(DEFAULT_DENSITY);
    setRadiusState(DEFAULT_RADIUS);
    setAccentState(DEFAULT_ACCENT);
    setSkeletonColorState(DEFAULT_SKELETON_COLOR);
    setSkeletonOpacityState(DEFAULT_SKELETON_OPACITY);
    setSkeletonSpeedState(DEFAULT_SKELETON_SPEED);
    setRippleColorState(DEFAULT_RIPPLE_COLOR);
    setRippleOpacityState(DEFAULT_RIPPLE_OPACITY);
    setRippleSpeedState(DEFAULT_RIPPLE_SPEED);
    setHoverColorState(DEFAULT_HOVER_COLOR);
    setHoverOpacityState(DEFAULT_HOVER_OPACITY);
    setTheme(DEFAULT_MODE);
    if (mounted) {
      document.documentElement.style.removeProperty('font-size');
      document.documentElement.style.removeProperty('--density');
      document.documentElement.style.removeProperty('--radius-scale');
      document.documentElement.style.setProperty('--primary', THEME_PRIMARY_COLORS[DEFAULT_MODE]);
      document.documentElement.style.setProperty('--brand', THEME_PRIMARY_COLORS[DEFAULT_MODE]);
      document.documentElement.style.removeProperty('--skeleton-color');
      document.documentElement.style.removeProperty('--skeleton-opacity');
      document.documentElement.style.removeProperty('--skeleton-speed');
      document.documentElement.style.removeProperty('--ripple-color');
      document.documentElement.style.removeProperty('--ripple-opacity');
      document.documentElement.style.removeProperty('--ripple-speed');
      document.documentElement.style.removeProperty('--hover-color');
      document.documentElement.style.removeProperty('--hover-opacity');
    }
  }, [setTheme, mounted]);

  return {
    mode,
    fontSize,
    density,
    radius,
    accent,
    skeletonColor,
    skeletonOpacity,
    skeletonSpeed,
    rippleColor,
    rippleOpacity,
    rippleSpeed,
    hoverColor,
    hoverOpacity,
    setMode,
    setFontSize,
    setDensity,
    setRadius,
    setAccent,
    setSkeletonColor,
    setSkeletonOpacity,
    setSkeletonSpeed,
    setRippleColor,
    setRippleOpacity,
    setRippleSpeed,
    setHoverColor,
    setHoverOpacity,
    reset,
  };
}
