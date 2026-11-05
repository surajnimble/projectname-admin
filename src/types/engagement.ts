import type {
  GiftCardData,
  GiftCardListData,
  LoyaltyHistoryData,
  LoyaltyPointsData,
  LoyaltyTiersData,
  LoyaltyTierData,
  LoyaltyTransactionData,
  ReferralData,
  ReferralListData,
  ReferralLeaderboardData,
  ReferralLeaderboardListData,
  ReferralCodeData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const baseList = (raw: Record<string, unknown>) => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
});

export const toLoyaltyPoints = (raw: Record<string, unknown> = {}): LoyaltyPointsData => ({
  userId: toString(raw.userId),
  isEnabled: raw.isEnabled === true,
  balance: toNumber(raw.balance),
  tier: toString(raw.tier),
  multiplier: toNumber(raw.multiplier),
  pointsToNextTier: toNumber(raw.pointsToNextTier),
  nextTier: toString(raw.nextTier),
  totalEarned: toNumber(raw.totalEarned),
  totalRedeemed: toNumber(raw.totalRedeemed),
  totalExpired: toNumber(raw.totalExpired),
  transactionCount: toNumber(raw.transactionCount),
  pointValue: toNumber(raw.pointValue),
  redeemableAmount: toNumber(raw.redeemableAmount),
  minRedeemPoints: toNumber(raw.minRedeemPoints),
  tierList: Array.isArray(raw.tierList) ? raw.tierList.filter(isObject).map(toLoyaltyTier) : [],
});

const toLoyaltyTier = (raw: Record<string, unknown> = {}): LoyaltyTierData => ({
  tierId: toString(raw.tierId),
  name: toString(raw.name),
  minPoints: toNumber(raw.minPoints),
  multiplier: toNumber(raw.multiplier),
  benefits: Array.isArray(raw.benefits) ? raw.benefits.filter(isObject).map(String) : [],
});

export const toLoyaltyTiers = (raw: Record<string, unknown> = {}): LoyaltyTiersData => ({
  loyaltyTierList: Array.isArray(raw.loyaltyTierList)
    ? raw.loyaltyTierList.filter(isObject).map(toLoyaltyTier)
    : [],
  totalRecord: toNumber(raw.totalRecord),
});

export const toLoyaltyTransaction = (raw: Record<string, unknown> = {}): LoyaltyTransactionData => ({
  transactionId: toString(raw.transactionId),
  userId: toString(raw.userId),
  points: toNumber(raw.points),
  type: toString(raw.type),
  description: toString(raw.description),
  referenceId: toString(raw.referenceId),
  createdAt: toString(raw.createdAt),
});

export const toLoyaltyHistory = (raw: Record<string, unknown> = {}): LoyaltyHistoryData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.loyaltyTransactionList)
    ? raw.loyaltyTransactionList.filter(isObject).map(toLoyaltyTransaction)
    : [],
});

export const toReferralCode = (raw: Record<string, unknown> = {}): ReferralCodeData => ({
  userId: toString(raw.userId),
  isEnabled: raw.isEnabled === true,
  referralCode: toString(raw.referralCode),
  referralCount: toNumber(raw.referralCount),
  completedCount: toNumber(raw.completedCount),
  totalEarned: toNumber(raw.totalEarned),
  referrerReward: toNumber(raw.referrerReward),
  refereeReward: toNumber(raw.refereeReward),
  expiryDays: toNumber(raw.expiryDays),
});

export const toReferral = (raw: Record<string, unknown> = {}): ReferralData => ({
  referralId: toString(raw.referralId),
  referrerId: toString(raw.referrerId),
  refereeId: toString(raw.refereeId),
  referralCode: toString(raw.referralCode),
  status: toString(raw.status),
  rewardEarned: toNumber(raw.rewardEarned),
  createdAt: toString(raw.createdAt),
});

export const toReferralList = (raw: Record<string, unknown> = {}): ReferralListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.referralList)
    ? raw.referralList.filter(isObject).map(toReferral)
    : [],
});

export const toReferralLeaderboard = (raw: Record<string, unknown> = {}): ReferralLeaderboardData => ({
  userId: toString(raw.userId),
  name: toString(raw.name),
  referralCount: toNumber(raw.referralCount),
  completedCount: toNumber(raw.completedCount),
  totalEarned: toNumber(raw.totalEarned),
  rank: toNumber(raw.rank),
});

export const toReferralLeaderboardList = (
  raw: Record<string, unknown> = {},
): ReferralLeaderboardListData => ({
  referralTierList: Array.isArray(raw.referralTierList)
    ? raw.referralTierList.filter(isObject).map(toReferralLeaderboard)
    : [],
  totalRecord: toNumber(raw.totalRecord),
});

export const toGiftCard = (raw: Record<string, unknown> = {}): GiftCardData => ({
  giftCardId: toString(raw.giftCardId),
  code: toString(raw.code),
  name: toString(raw.name),
  description: toString(raw.description),
  value: toNumber(raw.value),
  balance: toNumber(raw.balance),
  currency: toString(raw.currency),
  status: toString(raw.status),
  isActive: raw.isActive === true,
  expiresAt: toString(raw.expiresAt),
  createdAt: toString(raw.createdAt),
  usedBy: toString(raw.usedBy),
  usedAt: toString(raw.usedAt),
});

export const toGiftCardList = (raw: Record<string, unknown> = {}): GiftCardListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.giftCardList)
    ? raw.giftCardList.filter(isObject).map(toGiftCard)
    : [],
});
