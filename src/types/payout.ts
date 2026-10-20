import type { PayoutData, PayoutListData, PayoutStatementData } from '@/lib/api/contract';

type RawPayout = Partial<Record<keyof PayoutData, unknown>> & {
  bankData?: {
    upiId?: unknown;
    bankHolderName?: unknown;
    bankIfsc?: unknown;
    accountNo?: unknown;
  };
};
type RawPayoutList = Partial<Record<keyof Omit<PayoutListData, 'itemList'>, unknown>> & {
  itemList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toPayout = (raw: RawPayout = {}): PayoutData => ({
  payoutId: toString(raw.payoutId),
  vendorId: toString(raw.vendorId),
  amount: toNumber(raw.amount),
  method: toString(raw.method),
  status: toString(raw.status),
  period: toString(raw.period),
  reference: toString(raw.reference),
  notes: toString(raw.notes),
  rejectReason: toString(raw.rejectReason),
  requestedBy: toString(raw.requestedBy),
  approvedBy: toString(raw.approvedBy),
  isPending: raw.isPending === true,
  isApproved: raw.isApproved === true,
  isPaid: raw.isPaid === true,
  approvedAt: toString(raw.approvedAt),
  processedAt: toString(raw.processedAt),
  createdAt: toString(raw.createdAt),
  bankData: {
    upiId: toString(raw.bankData?.upiId),
    bankHolderName: toString(raw.bankData?.bankHolderName),
    bankIfsc: toString(raw.bankData?.bankIfsc),
    accountNo: toString(raw.bankData?.accountNo),
  },
});

export const toPayoutList = (raw: RawPayoutList = {}): PayoutListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toPayout(item))
    : [],
});

export const toPayoutStatement = (raw: Partial<PayoutStatementData> = {}): PayoutStatementData => ({
  grossAmount: toNumber(raw.grossAmount),
  commissionAmount: toNumber(raw.commissionAmount),
  netAmount: toNumber(raw.netAmount),
  earningList: Array.isArray(raw.earningList)
    ? raw.earningList.filter(isObject).map((item) => ({
        earningId: toString(item.earningId),
        orderId: toString(item.orderId),
        amount: toNumber(item.amount),
        netAmount: toNumber(item.netAmount),
        commission: toNumber(item.commission),
        status: toString(item.status),
        createdAt: toString(item.createdAt),
      }))
    : [],
});
