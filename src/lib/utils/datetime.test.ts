import { describe, expect, it } from 'vitest';
import { formatLongDate, formatRelativeTime } from './datetime';

const now = Date.parse('2026-10-21T12:00:00.000Z');

describe('formatRelativeTime', () => {
  it('formats recent times in minutes', () => {
    expect(formatRelativeTime('2026-10-21T11:58:00.000Z', now)).toBe('2 minutes ago');
  });

  it('formats hours and days', () => {
    expect(formatRelativeTime('2026-10-21T09:00:00.000Z', now)).toBe('3 hours ago');
    expect(formatRelativeTime('2026-10-20T12:00:00.000Z', now)).toBe('yesterday');
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeTime('not-a-date', now)).toBe('');
  });
});

describe('formatLongDate', () => {
  it('formats a full weekday date', () => {
    expect(formatLongDate(new Date(2026, 9, 21, 12))).toBe('Wednesday, Oct 21, 2026');
  });
});
