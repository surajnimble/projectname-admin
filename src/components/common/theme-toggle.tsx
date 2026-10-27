'use client';

import { Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/messages';
import {
  useThemeSettings,
  type Accent,
  type ThemeMode,
} from '@/hooks/use-theme-settings';

const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: MESSAGES.common.themeLight },
  { value: 'dark', label: MESSAGES.common.themeDark },
  { value: 'system', label: MESSAGES.common.themeSystem },
];

const THEME_VARIANTS: {
  value: ThemeMode;
  label: string;
  bgClass: string;
  primaryColor: string;
}[] = [
  { value: 'luxury', label: MESSAGES.common.themeLuxury, bgClass: 'bg-accent-luxury', primaryColor: '#c58b3e' },
  { value: 'retro', label: MESSAGES.common.themeRetro, bgClass: 'bg-accent-retro', primaryColor: '#b08968' },
  { value: 'arctic', label: MESSAGES.common.themeArctic, bgClass: 'bg-accent-arctic', primaryColor: '#22d3ee' },
  { value: 'nature', label: MESSAGES.common.themeNature, bgClass: 'bg-accent-nature', primaryColor: '#4ade80' },
  { value: 'ember', label: MESSAGES.common.themeEmber, bgClass: 'bg-accent-ember', primaryColor: '#fb923c' },
  { value: 'dracula', label: MESSAGES.common.themeDracula, bgClass: 'bg-accent-dracula', primaryColor: '#bd93f9' },
  { value: 'midnight', label: MESSAGES.common.themeMidnight, bgClass: 'bg-accent-midnight', primaryColor: '#38bdf8' },
];

const ACCENT_SWATCHES: { value: Accent; label: string; className: string; color: string }[] = [
  { value: 'indigo', label: MESSAGES.common.themeAccentIndigo, className: 'bg-accent-indigo', color: '#4f46e5' },
  { value: 'blue', label: MESSAGES.common.themeAccentBlue, className: 'bg-accent-blue', color: '#2563eb' },
  { value: 'green', label: MESSAGES.common.themeAccentGreen, className: 'bg-accent-green', color: '#16a34a' },
  { value: 'red', label: MESSAGES.common.themeAccentRed, className: 'bg-accent-red', color: '#dc2626' },
  { value: 'orange', label: MESSAGES.common.themeAccentOrange, className: 'bg-accent-orange', color: '#d97706' },
];

function OptionCard({
  label,
  selected,
  className,
  onClick,
  swatch,
  primaryDot,
}: {
  label: string;
  selected: boolean;
  className?: string;
  onClick: () => void;
  swatch?: string;
  primaryDot?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 justify-between w-full text-left border border-border rounded-lg overflow-hidden',
        selected
          ? 'border-primary border-2 bg-primary dark:bg-primary/70 text-primary-foreground ring-1 ring-primary/30'
          : 'hover:border-border hover:bg-surface-muted',
        className,
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {swatch && (
          <span
            className={cn(
              'size-4 rounded-full shrink-0 border border-border-strong',
              selected ? 'border-white/50' : 'border-border-strong',
              swatch,
            )}
          />
        )}
        <span className="text-sm leading-none">{label}</span>
        {primaryDot && (
          <span
            className="size-3 rounded-full border border-white/50"
            style={{ backgroundColor: primaryDot }}
          />
        )}
      </div>
      {selected && <span aria-hidden="true" className="text-primary-foreground font-bold">✓</span>}
    </Button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-fg text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-fg-muted text-xs">{format ? format(value) : `${value}${unit}`}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-2 bg-surface-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
    </section>
  );
}

function ColorPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; color: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-fg text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-fg-muted text-xs">{options.find((o) => o.value === value)?.label ?? value}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={opt.label}
            aria-pressed={value === opt.value}
            className={cn(
              opt.color === 'var(--primary)' || opt.color.startsWith('var(')
                ? 'bg-[var(--primary)]'
                : `bg-[${opt.color}]`,
              value === opt.value ? 'border-2 border-primary ring-1 ring-primary/20' : 'border-transparent',
            )}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
    </section>
  );
}

export function ThemeToggle() {
  const {
    mode,
    fontSize,
    accent,
    density,
    radius,
    skeletonColor,
    skeletonOpacity,
    skeletonSpeed,
    rippleColor,
    rippleOpacity,
    rippleSpeed,
    setMode,
    setFontSize,
    setAccent,
    setDensity,
    setRadius,
    setSkeletonColor,
    setSkeletonOpacity,
    setSkeletonSpeed,
    setRippleColor,
    setRippleOpacity,
    setRippleSpeed,
    reset,
  } = useThemeSettings();
  const [open, setOpen] = useState(false);

  const ACCENT_PREVIEW_COLOR: Record<Accent, string> = {
    indigo: '#4f46e5',
    blue: '#2563eb',
    green: '#16a34a',
    red: '#dc2626',
    orange: '#d97706',
  };

  const THEME_MODE_PRIMARY_COLORS: Record<ThemeMode, string> = {
    light: ACCENT_PREVIEW_COLOR[accent],
    dark: ACCENT_PREVIEW_COLOR[accent],
    system: ACCENT_PREVIEW_COLOR[accent],
    luxury: '#c58b3e',
    retro: '#b08968',
    arctic: '#22d3ee',
    nature: '#4ade80',
    ember: '#fb923c',
    dracula: '#bd93f9',
    midnight: '#38bdf8',
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={MESSAGES.common.themeSettings}
        onClick={() => setOpen(true)}
      >
        <Settings className="size-5" aria-hidden="true" />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={MESSAGES.common.themeSettings}
        closeLabel={MESSAGES.common.close}
        footer={
          <>
            <Button type="button" variant="outline" onClick={reset}>
              {MESSAGES.common.reset}
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              {MESSAGES.common.done}
            </Button>
          </>
        }
      >
        <div className="flex max-h-[60dvh] flex-col gap-5 overflow-y-auto pr-2 sm:max-h-[65dvh]">
          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themeMode}
            </h3>
            <div className="grid w-full grid-cols-3 gap-2">
              {THEME_MODES.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  selected={mode === option.value}
                  primaryDot={THEME_MODE_PRIMARY_COLORS[option.value]}
                  onClick={() => setMode(option.value)}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              Theme
            </h3>
            <div className="grid w-full grid-cols-4 gap-2">
              {THEME_VARIANTS.map((variant) => (
                <OptionCard
                  key={variant.value}
                  label={variant.label}
                  selected={mode === variant.value}
                  swatch={variant.bgClass}
                  primaryDot={variant.primaryColor}
                  onClick={() => setMode(variant.value)}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themePrimary}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'size-4 rounded-full border-2 border-primary',
                  `bg-[${ACCENT_PREVIEW_COLOR[accent]}]`,
                )}
              />
              <span className="text-fg-muted text-xs">{ACCENT_SWATCHES.find((s) => s.value === accent)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {ACCENT_SWATCHES.map((swatch) => (
                <Button
                  key={swatch.value}
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={swatch.label}
                  aria-pressed={accent === swatch.value}
                  className={cn(
                    swatch.className,
                    accent === swatch.value ? 'border-2 border-primary ring-1 ring-primary/20' : '',
                  )}
                  onClick={() => setAccent(swatch.value)}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themeFontSizeValue}
            </h3>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="grid w-full grid-cols-3 gap-2">
                {[
                  { value: 14, label: MESSAGES.common.themeFontSmall },
                  { value: 16, label: MESSAGES.common.themeFontMedium },
                  { value: 18, label: MESSAGES.common.themeFontLarge },
                ].map((size) => (
                  <OptionCard
                    key={String(size.value)}
                    label={size.label}
                    selected={fontSize === size.value}
                    onClick={() => setFontSize(size.value)}
                  />
                ))}
              </div>
              <Slider
                label=""
                value={fontSize}
                min={12}
                max={24}
                step={1}
                unit="px"
                format={(v) => `${v}px`}
                onChange={setFontSize}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themeDensityValue}
            </h3>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="grid w-full grid-cols-2 gap-2">
                {[
                  { value: 0.85, label: MESSAGES.common.themeDensityCompact },
                  { value: 1, label: MESSAGES.common.themeDensityComfortable },
                ].map((option) => (
                  <OptionCard
                    key={String(option.value)}
                    label={option.label}
                    selected={Math.abs(density - option.value) < 0.001}
                    onClick={() => setDensity(option.value)}
                  />
                ))}
              </div>
              <Slider
                label=""
                value={density}
                min={0.7}
                max={1.3}
                step={0.05}
                unit="×"
                format={(v) => v.toFixed(2)}
                onChange={setDensity}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themeRadiusValue}
            </h3>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="grid w-full grid-cols-4 gap-2">
                {[
                  { value: 0.6, label: MESSAGES.common.themeRadiusSharp },
                  { value: 1, label: MESSAGES.common.themeRadiusStandard },
                  { value: 1.2, label: MESSAGES.common.themeRadiusRounded },
                  { value: 1.8, label: MESSAGES.common.themeRadiusExtra },
                ].map((option) => (
                  <OptionCard
                    key={String(option.value)}
                    label={option.label}
                    selected={Math.abs(radius - option.value) < 0.001}
                    onClick={() => setRadius(option.value)}
                  />
                ))}
              </div>
              <Slider
                label=""
                value={radius}
                min={0.5}
                max={2.0}
                step={0.05}
                unit="×"
                format={(v) => v.toFixed(2)}
                onChange={setRadius}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themeSkeleton}
            </h3>
            <ColorPicker
              label={MESSAGES.common.themeSkeletonColor}
              value={skeletonColor}
              options={[
                { value: 'var(--muted)', label: 'Muted', color: '#a1a1aa' },
                { value: 'var(--primary)', label: 'Primary', color: 'var(--primary)' },
                { value: 'var(--success)', label: 'Success', color: '#22c55e' },
                { value: 'var(--warning)', label: 'Warning', color: '#f59e0b' },
                { value: 'var(--destructive)', label: 'Destructive', color: '#ef4444' },
              ]}
              onChange={setSkeletonColor}
            />
            <Slider
              label={MESSAGES.common.themeSkeletonOpacity}
              value={skeletonOpacity}
              min={0}
              max={1}
              step={0.05}
              unit=""
              format={(v) => v.toFixed(2)}
              onChange={setSkeletonOpacity}
            />
            <Slider
              label={MESSAGES.common.themeSkeletonSpeed}
              value={skeletonSpeed}
              min={0.5}
              max={3}
              step={0.1}
              unit="s"
              format={(v) => v.toFixed(1)}
              onChange={setSkeletonSpeed}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-xs font-semibold uppercase tracking-wider">
              {MESSAGES.common.themeRipple}
            </h3>
            <ColorPicker
              label={MESSAGES.common.themeRippleColor}
              value={rippleColor}
              options={[
                { value: 'var(--primary)', label: 'Primary', color: 'var(--primary)' },
                { value: 'var(--success)', label: 'Success', color: '#22c55e' },
                { value: 'var(--warning)', label: 'Warning', color: '#f59e0b' },
                { value: 'var(--destructive)', label: 'Destructive', color: '#ef4444' },
                { value: 'rgba(255,255,255,.35)', label: 'White', color: 'rgba(255,255,255,.35)' },
              ]}
              onChange={setRippleColor}
            />
            <Slider
              label={MESSAGES.common.themeRippleOpacity}
              value={rippleOpacity}
              min={0}
              max={1}
              step={0.05}
              unit=""
              format={(v) => v.toFixed(2)}
              onChange={setRippleOpacity}
            />
            <Slider
              label={MESSAGES.common.themeRippleSpeed}
              value={rippleSpeed}
              min={0.2}
              max={1}
              step={0.05}
              unit="s"
              format={(v) => v.toFixed(2)}
              onChange={setRippleSpeed}
            />
          </section>
        </div>
      </Dialog>
    </>
  );
}
