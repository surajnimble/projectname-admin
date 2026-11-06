import type { GiftCardData, GiftCardListData } from '@/lib/api/contract';

const n = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0);
const s = (value: unknown) => (typeof value === 'string' ? value : '');
const o = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? value as Record<string, unknown> : {});

export const toGiftCard = (value: unknown): GiftCardData => {
  const raw = o(value);
  return {
    giftCardId: s(raw.giftCardId), code: s(raw.code), title: s(raw.title), description: s(raw.description),
    value: n(raw.value), status: s(raw.status), userId: s(raw.userId), usedOrderId: s(raw.usedOrderId),
    expiresAt: s(raw.expiresAt), redeemedAt: s(raw.redeemedAt), createdAt: s(raw.createdAt),
  };
};

export const toGiftCardList = (value: unknown = {}): GiftCardListData => {
  const raw = o(value);
  const rows = Array.isArray(raw.giftCardList) ? raw.giftCardList : [];
  return {
    totalRecord: n(raw.totalRecord), totalPage: n(raw.totalPage), currentPage: n(raw.currentPage), limit: n(raw.limit),
    hasNext: raw.hasNext === true, hasPrevious: raw.hasPrevious === true,
    nextPage: n(raw.nextPage), previousPage: n(raw.previousPage), itemList: rows.map(toGiftCard),
  };
};
