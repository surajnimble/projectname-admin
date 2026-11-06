import type {
  LoyaltySummaryData,
  LoyaltyTierData,
  LoyaltyTierListData,
  LoyaltyTransactionData,
  LoyaltyTransactionListData,
} from '@/lib/api/contract';

const n = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0);
const s = (value: unknown) => (typeof value === 'string' ? value : '');
const o = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? value as Record<string, unknown> : {});

const toTier = (value: unknown): LoyaltyTierData => {
  const raw = o(value);
  return { name: s(raw.name), minPoints: n(raw.minPoints), multiplier: n(raw.multiplier) };
};

export const toLoyaltySummary = (value: unknown = {}): LoyaltySummaryData => {
  const raw = o(value);
  return {
    userId: s(raw.userId), isEnabled: raw.isEnabled === true, balance: n(raw.balance), tier: s(raw.tier),
    multiplier: n(raw.multiplier), pointsToNextTier: n(raw.pointsToNextTier), nextTier: s(raw.nextTier),
    totalEarned: n(raw.totalEarned), totalRedeemed: n(raw.totalRedeemed), totalExpired: n(raw.totalExpired),
    transactionCount: n(raw.transactionCount), pointValue: n(raw.pointValue), redeemableAmount: n(raw.redeemableAmount),
    minRedeemPoints: n(raw.minRedeemPoints), tierList: Array.isArray(raw.tierList) ? raw.tierList.map(toTier) : [],
  };
};

export const toLoyaltyTierList = (value: unknown = {}): LoyaltyTierListData => {
  const raw = o(value);
  return { loyaltyTierList: Array.isArray(raw.loyaltyTierList) ? raw.loyaltyTierList.map(toTier) : [], totalRecord: n(raw.totalRecord) };
};

const toTransaction = (value: unknown): LoyaltyTransactionData => {
  const raw = o(value);
  return {
    transactionId: s(raw.transactionId), type: s(raw.type), points: n(raw.points), balanceAfter: n(raw.balanceAfter),
    orderId: s(raw.orderId), description: s(raw.description), createdAt: s(raw.createdAt),
  };
};

export const toLoyaltyTransactionList = (value: unknown = {}): LoyaltyTransactionListData => {
  const raw = o(value);
  const rows = Array.isArray(raw.loyaltyTransactionList) ? raw.loyaltyTransactionList : [];
  return {
    totalRecord: n(raw.totalRecord), totalPage: n(raw.totalPage), currentPage: n(raw.currentPage), limit: n(raw.limit),
    hasNext: raw.hasNext === true, hasPrevious: raw.hasPrevious === true, nextPage: n(raw.nextPage), previousPage: n(raw.previousPage),
    itemList: rows.map(toTransaction),
  };
};
