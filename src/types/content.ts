import type {
  PageContentData,
  PageListData,
  BlogData,
  BlogListData,
  FaqData,
  FaqListData,
  BannerData,
  BannerListData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const get = (obj: Record<string, unknown>, key: string): unknown => obj[key];

const findList = (
  raw: Record<string, unknown>,
  ...keys: string[]
): Record<string, unknown>[] | undefined => {
  for (const key of keys) {
    const val = raw[key];
    if (Array.isArray(val)) return val as Record<string, unknown>[];
  }
  return undefined;
};

export const toPageContent = (raw: Record<string, unknown>): PageContentData => ({
  pageId: toString(get(raw, 'pageId')),
  title: toString(get(raw, 'title')),
  slug: toString(get(raw, 'slug')),
  content: toString(get(raw, 'content')),
  isPublished: toBoolean(get(raw, 'isPublished')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toPageList = (raw: Partial<PageListData> = {}): PageListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'pageList');
    return list ? list.filter(isObject).map((item) => toPageContent(item)) : [];
  })(),
});

export const toBlog = (raw: Record<string, unknown>): BlogData => ({
  blogId: toString(get(raw, 'blogId')),
  title: toString(get(raw, 'title')),
  slug: toString(get(raw, 'slug')),
  excerpt: toString(get(raw, 'excerpt')),
  content: toString(get(raw, 'content')),
  isPublished: toBoolean(get(raw, 'isPublished')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toBlogList = (raw: Partial<BlogListData> = {}): BlogListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'blogList');
    return list ? list.filter(isObject).map((item) => toBlog(item)) : [];
  })(),
});

export const toFaq = (raw: Record<string, unknown>): FaqData => ({
  faqId: toString(get(raw, 'faqId')),
  question: toString(get(raw, 'question')),
  answer: toString(get(raw, 'answer')),
  category: toString(get(raw, 'category')),
  isPublished: toBoolean(get(raw, 'isActive')),
  sortOrder: toNumber(get(raw, 'sortOrder')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toFaqList = (raw: Partial<FaqListData> = {}): FaqListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'faqList');
    return list ? list.filter(isObject).map((item) => toFaq(item)) : [];
  })(),
});

export const toBanner = (raw: Record<string, unknown>): BannerData => ({
  bannerId: toString(get(raw, 'bannerId')),
  title: toString(get(raw, 'title')),
  subtitle: toString(get(raw, 'subtitle')),
  image: toString(get(raw, 'image')),
  linkUrl: toString(get(raw, 'linkUrl')),
  position: toString(get(raw, 'position')),
  isActive: toBoolean(get(raw, 'isActive')),
  startAt: toString(get(raw, 'startAt')),
  endAt: toString(get(raw, 'endAt')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toBannerList = (raw: Partial<BannerListData> = {}): BannerListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'bannerList');
    return list ? list.filter(isObject).map((item) => toBanner(item)) : [];
  })(),
});
