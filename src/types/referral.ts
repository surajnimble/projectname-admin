import type { ReferralData, ReferralListData } from '@/lib/api/contract';

const n = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0);
const s = (value: unknown) => (typeof value === 'string' ? value : '');
const o = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? value as Record<string, unknown> : {});

export const toReferral = (value: unknown): ReferralData => {
  const raw = o(value);
  const user = o(raw.userData);
  return {
    referralId: s(raw.referralId), referralCode: s(raw.referralCode), status: s(raw.status),
    referrerReward: n(raw.referrerReward), refereeReward: n(raw.refereeReward),
    completedAt: s(raw.completedAt), expiresAt: s(raw.expiresAt), createdAt: s(raw.createdAt),
    userData: { userId: s(user.userId), name: s(user.name), email: s(user.email) },
  };
};

export const toReferralList = (value: unknown = {}): ReferralListData => {
  const raw = o(value);
  const rows = Array.isArray(raw.referralList) ? raw.referralList : [];
  return {
    totalRecord: n(raw.totalRecord), totalPage: n(raw.totalPage), currentPage: n(raw.currentPage), limit: n(raw.limit),
    hasNext: raw.hasNext === true, hasPrevious: raw.hasPrevious === true,
    nextPage: n(raw.nextPage), previousPage: n(raw.previousPage), itemList: rows.map(toReferral),
  };
};
