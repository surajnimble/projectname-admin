import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CURRENCY } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return value.toLocaleString(CURRENCY.locale);
}

export function formatCurrency(value: unknown): string {
  const amount =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : null;
  if (amount === null || !Number.isFinite(amount)) return '';
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function identifierToCredentials(identifier: string): { email?: string; phone?: string } {
  const value = identifier.trim();
  return value.includes('@') ? { email: value } : { phone: value };
}

export function maskAccount(value: string): string {
  const digits = value.replace(/\s/g, '');
  if (!digits) return '';
  if (digits.length <= 4) return '••••';
  return `•••• ${digits.slice(-4)}`;
}
