import type { NewsletterSubscriberData, NewsletterSubscriberListData } from '@/lib/api/contract';

const n = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0);
const s = (value: unknown) => (typeof value === 'string' ? value : '');
const o = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? value as Record<string, unknown> : {});

export const toNewsletterSubscriber = (value: unknown): NewsletterSubscriberData => {
  const raw = o(value);
  return {
    subscriberId: s(raw.subscriberId), email: s(raw.email), isActive: raw.isActive === true,
    isSubscribed: raw.isSubscribed === true, subscribedAt: s(raw.subscribedAt), unsubscribedAt: s(raw.unsubscribedAt),
  };
};

export const toNewsletterSubscriberList = (value: unknown = {}): NewsletterSubscriberListData => {
  const raw = o(value);
  const rows = Array.isArray(raw.subscriberList) ? raw.subscriberList : [];
  return {
    totalRecord: n(raw.totalRecord), totalPage: n(raw.totalPage), currentPage: n(raw.currentPage), limit: n(raw.limit),
    hasNext: raw.hasNext === true, hasPrevious: raw.hasPrevious === true,
    nextPage: n(raw.nextPage), previousPage: n(raw.previousPage), itemList: rows.map(toNewsletterSubscriber),
  };
};
