import { DATE_LOCALE } from '@/constants';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', YEAR],
  ['month', MONTH],
  ['week', WEEK],
  ['day', DAY],
  ['hour', HOUR],
  ['minute', MINUTE],
  ['second', 1],
];

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return '';

  const seconds = Math.round((time - now) / 1000);
  const [unit, size] = UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? [
    'second',
    1,
  ];
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round(seconds / size),
    unit,
  );
}

export function formatLongDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
