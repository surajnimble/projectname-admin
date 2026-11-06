import type {
  WalletSummaryData,
  WalletTransactionData,
  WalletTransactionListData,
} from '@/lib/api/contract';

const numberValue = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '');
const objectValue = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

export const toWalletSummary = (rawValue: unknown = {}): WalletSummaryData => {
  const raw = objectValue(rawValue);
  return {
    isEnabled: raw.isEnabled === true,
    balance: numberValue(raw.balance),
    totalCredited: numberValue(raw.totalCredited),
    totalDebited: numberValue(raw.totalDebited),
    maxBalance: numberValue(raw.maxBalance),
    minRedeem: numberValue(raw.minRedeem),
    expiryDays: numberValue(raw.expiryDays),
    canRedeem: raw.canRedeem === true,
  };
};

export const toWalletTransaction = (rawValue: unknown = {}): WalletTransactionData => {
  const raw = objectValue(rawValue);
  return {
    transactionId: stringValue(raw.transactionId),
    type: stringValue(raw.type),
    amount: numberValue(raw.amount),
    balanceAfter: numberValue(raw.balanceAfter),
    orderId: stringValue(raw.orderId),
    description: stringValue(raw.description),
    reference: stringValue(raw.reference),
    isCredit: raw.isCredit === true,
    createdAt: stringValue(raw.createdAt),
  };
};

export const toWalletTransactionList = (rawValue: unknown = {}): WalletTransactionListData => {
  const raw = objectValue(rawValue);
  const page = (key: string) => numberValue(raw[key]);
  const rows = Array.isArray(raw.walletList) ? raw.walletList : [];
  return {
    totalRecord: page('totalRecord'),
    totalPage: page('totalPage'),
    currentPage: page('currentPage'),
    limit: page('limit'),
    hasNext: raw.hasNext === true,
    hasPrevious: raw.hasPrevious === true,
    nextPage: page('nextPage'),
    previousPage: page('previousPage'),
    itemList: rows.map(toWalletTransaction),
  };
};
