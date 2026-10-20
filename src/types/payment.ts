import type { PaymentListData, PaymentOrderData, PaymentSummaryData } from '@/lib/api/contract';

type RawPaymentOrder = Partial<Record<keyof PaymentOrderData, unknown>>;
type RawPaymentSummary = Partial<Record<keyof Omit<PaymentSummaryData, 'orderData'>, unknown>> & {
  orderData?: RawPaymentOrder;
};
type RawPaymentList = Partial<Record<keyof Omit<PaymentListData, 'itemList'>, unknown>> & {
  itemList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toPaymentOrder = (raw: RawPaymentOrder = {}): PaymentOrderData => ({
  orderId: toString(raw.orderId),
  orderNumber: toString(raw.orderNumber),
  status: toString(raw.status),
  total: toNumber(raw.total),
});

export const toPaymentSummary = (raw: RawPaymentSummary = {}): PaymentSummaryData => ({
  paymentId: toString(raw.paymentId),
  orderId: toString(raw.orderId),
  amount: toNumber(raw.amount),
  paidAmount: toNumber(raw.paidAmount),
  method: toString(raw.method),
  status: toString(raw.status),
  reference: toString(raw.reference),
  isTokenPayment: raw.isTokenPayment === true,
  isBalancePayment: raw.isBalancePayment === true,
  isPaid: raw.isPaid === true,
  paidAt: toString(raw.paidAt),
  createdAt: toString(raw.createdAt),
  orderData: toPaymentOrder(raw.orderData),
});

export const toPaymentList = (raw: RawPaymentList = {}): PaymentListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toPaymentSummary(item))
    : [],
});
