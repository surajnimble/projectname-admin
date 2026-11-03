import type {
  AnalyticsAppVersionData,
  AnalyticsAppVersionListData,
  AnalyticsConversionData,
  AnalyticsConversionListData,
  AnalyticsCrashData,
  AnalyticsCrashListData,
  AnalyticsDeviceData,
  AnalyticsDeviceListData,
  AnalyticsGeoData,
  AnalyticsGeoListData,
  AnalyticsOverviewData,
  AnalyticsPageViewData,
  AnalyticsPageItemListData,
  AnalyticsSessionData,
  AnalyticsSessionListData,
  AnalyticsTrafficSourceData,
  AnalyticsTrafficListData,
  AnalyticsVisitorData,
  AnalyticsVisitorListData,
  PageData,
  ProductPerformanceData,
  ProductPerformanceListData,
} from '@/lib/api/contract';

export type ProductPerformanceSort = 'revenue' | 'qty';

type RawList = Partial<
  Record<keyof Omit<PageData<unknown>, 'itemList'>, unknown>
> & {
  list?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const mapList = <T>(raw: RawList, mapper: (item: Record<string, unknown>) => T): T[] =>
  Array.isArray(raw.list)
    ? raw.list.filter(isObject).map((item) => mapper(item))
    : [];

const baseList = (raw: RawList) => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
});

export const toAnalyticsOverview = (raw: Partial<AnalyticsOverviewData> = {}): AnalyticsOverviewData => ({
  totalRevenue: toNumber(raw.totalRevenue),
  totalOrders: toNumber(raw.totalOrders),
  totalCustomers: toNumber(raw.totalCustomers),
  totalProducts: toNumber(raw.totalProducts),
  conversionRate: toNumber(raw.conversionRate),
  avgOrderValue: toNumber(raw.avgOrderValue),
});

export const toVisitor = (raw: Record<string, unknown>): AnalyticsVisitorData => ({
  date: toString(raw.date),
  visitors: toNumber(raw.visitors),
  uniqueVisitors: toNumber(raw.uniqueVisitors),
  pageViews: toNumber(raw.pageViews),
});

export const toVisitorList = (raw: RawList = {}): AnalyticsVisitorListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toVisitor),
});

export const toPageView = (raw: Record<string, unknown>): AnalyticsPageViewData => ({
  path: toString(raw.path),
  title: toString(raw.title),
  views: toNumber(raw.views),
  uniqueViews: toNumber(raw.uniqueViews),
  bounceRate: toNumber(raw.bounceRate),
});

export const toPageItemList = (raw: RawList = {}): AnalyticsPageItemListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toPageView),
});

export const toTrafficSource = (raw: Record<string, unknown>): AnalyticsTrafficSourceData => ({
  source: toString(raw.source),
  medium: toString(raw.medium),
  visits: toNumber(raw.visits),
  conversions: toNumber(raw.conversions),
});

export const toTrafficList = (raw: RawList = {}): AnalyticsTrafficListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toTrafficSource),
});

export const toDevice = (raw: Record<string, unknown>): AnalyticsDeviceData => ({
  device: toString(raw.device),
  os: toString(raw.os),
  browser: toString(raw.browser),
  visitors: toNumber(raw.visitors),
});

export const toDeviceList = (raw: RawList = {}): AnalyticsDeviceListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toDevice),
});

export const toGeo = (raw: Record<string, unknown>): AnalyticsGeoData => ({
  country: toString(raw.country),
  city: toString(raw.city),
  visitors: toNumber(raw.visitors),
  conversions: toNumber(raw.conversions),
});

export const toGeoList = (raw: RawList = {}): AnalyticsGeoListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toGeo),
});

export const toSession = (raw: Record<string, unknown>): AnalyticsSessionData => ({
  sessionId: toString(raw.sessionId),
  userId: toString(raw.userId),
  userName: toString(raw.userName),
  device: toString(raw.device),
  country: toString(raw.country),
  pagesViewed: toNumber(raw.pagesViewed),
  duration: toNumber(raw.duration),
  lastActivity: toString(raw.lastActivity),
  isActive: raw.isActive === true,
});

export const toSessionList = (raw: RawList = {}): AnalyticsSessionListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toSession),
});

export const toConversion = (raw: Record<string, unknown>): AnalyticsConversionData => ({
  date: toString(raw.date),
  visitors: toNumber(raw.visitors),
  conversions: toNumber(raw.conversions),
  rate: toNumber(raw.rate),
  revenue: toNumber(raw.revenue),
});

export const toConversionList = (raw: RawList = {}): AnalyticsConversionListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toConversion),
});

export const toCrash = (raw: Record<string, unknown>): AnalyticsCrashData => ({
  crashId: toString(raw.crashId),
  appVersion: toString(raw.appVersion),
  os: toString(raw.os),
  device: toString(raw.device),
  error: toString(raw.error),
  count: toNumber(raw.count),
  lastOccurred: toString(raw.lastOccurred),
});

export const toCrashList = (raw: RawList = {}): AnalyticsCrashListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toCrash),
});

export const toAppVersion = (raw: Record<string, unknown>): AnalyticsAppVersionData => ({
  version: toString(raw.version),
  users: toNumber(raw.users),
  sessions: toNumber(raw.sessions),
  crashes: toNumber(raw.crashes),
  crashRate: toNumber(raw.crashRate),
});

export const toAppVersionList = (raw: RawList = {}): AnalyticsAppVersionListData => ({
  ...baseList(raw),
  itemList: mapList(raw, toAppVersion),
});

type RawProductPerformance = Partial<Record<keyof ProductPerformanceData, unknown>>;
type RawProductPerformanceList = Partial<
  Record<keyof Omit<ProductPerformanceListData, 'itemList'>, unknown>
> & {
  productList?: unknown;
};

export const toProductPerformance = (
  raw: RawProductPerformance = {},
): ProductPerformanceData => ({
  productId: toString(raw.productId),
  name: toString(raw.name),
  qty: toNumber(raw.qty),
  revenue: toNumber(raw.revenue),
  views: toNumber(raw.views),
  rating: toNumber(raw.rating),
});

export const toProductPerformanceList = (
  raw: RawProductPerformanceList = {},
): ProductPerformanceListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.productList)
    ? raw.productList.filter(isObject).map((item) => toProductPerformance(item))
    : [],
});