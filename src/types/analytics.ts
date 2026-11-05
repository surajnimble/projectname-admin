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
  AnalyticsRevenueReportData,
  AnalyticsSessionData,
  AnalyticsSessionListData,
  AnalyticsTrafficSourceData,
  AnalyticsTrafficListData,
  AnalyticsVisitorData,
  AnalyticsVisitorListData,
  AnalyticsVendorPerformanceData,
  AnalyticsVendorPerformanceListData,
  AnalyticsCustomerCohortData,
  AnalyticsCustomerCohortsData,
  AnalyticsAbandonedCartData,
  AnalyticsAbandonedCartsListData,
  AnalyticsSearchTermData,
  AnalyticsSearchTermListData,
  AnalyticsZeroResultSearchData,
  AnalyticsZeroResultSearchListData,
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

export const toAnalyticsOverview = (raw: Record<string, unknown> = {}): AnalyticsOverviewData => ({
  totalRevenue: toNumber(raw.revenue),
  totalOrders: toNumber(raw.orders),
  totalCustomers: toNumber(raw.newUsers),
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

export const toVisitorList = (raw: Record<string, unknown> = {}): AnalyticsVisitorListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.byDay)
    ? raw.byDay
        .filter(isObject)
        .map((item) => ({
          date: toString(item.date),
          visitors: toNumber(item.count),
          uniqueVisitors: 0,
          pageViews: 0,
        }))
    : [],
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
  visits: toNumber(raw.views ?? raw.visits),
  conversions: toNumber(raw.visitors ?? raw.conversions),
});

export const toTrafficList = (raw: Record<string, unknown> = {}): AnalyticsTrafficListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.sourceList)
    ? raw.sourceList.filter(isObject).map(toTrafficSource)
    : [],
});

export const toDevice = (raw: Record<string, unknown>): AnalyticsDeviceData => ({
  device: toString(raw.device),
  os: toString(raw.os),
  browser: toString(raw.browser),
  visitors: toNumber(raw.visitors),
});

export const toDeviceList = (raw: Record<string, unknown> = {}): AnalyticsDeviceListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.osList)
    ? raw.osList
        .filter(isObject)
        .map((item) => ({
          device: toString(item.key),
          os: toString(item.key),
          browser: '',
          visitors: toNumber(item.count),
        }))
    : [],
});

export const toGeo = (raw: Record<string, unknown>): AnalyticsGeoData => ({
  country: toString(raw.country),
  city: toString(raw.city),
  visitors: toNumber(raw.visitors),
  conversions: toNumber(raw.conversions),
});

export const toGeoList = (raw: Record<string, unknown> | unknown[] = []): AnalyticsGeoListData => {
  const list = Array.isArray(raw) ? raw : (raw as Record<string, unknown>).list;
  return {
    ...baseList(raw as Record<string, unknown>),
    itemList: Array.isArray(list) ? list.filter(isObject).map(toGeo) : [],
  };
};

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

export const toConversionList = (raw: Record<string, unknown> = {}): AnalyticsConversionListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.series)
    ? raw.series
        .filter(isObject)
        .map((item) => ({
          date: toString(item.date),
          visitors: 0,
          conversions: toNumber(item.orders),
          rate: 0,
          revenue: toNumber(item.revenue),
        }))
    : [],
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

export const toAppVersionList = (raw: Record<string, unknown> = {}): AnalyticsAppVersionListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.versionList)
    ? raw.versionList
        .filter(isObject)
        .map((item) => ({
          version: toString(item.appVersion),
          users: toNumber(item.deviceCount),
          sessions: 0,
          crashes: 0,
          crashRate: 0,
        }))
    : [],
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

export const toVendorPerformance = (raw: Record<string, unknown> = {}): AnalyticsVendorPerformanceData => ({
  vendorId: toString(raw.vendorId),
  shopName: toString(raw.shopName),
  slug: toString(raw.slug),
  status: toString(raw.status),
  commissionRate: toNumber(raw.commissionRate),
  subOrderCount: toNumber(raw.subOrderCount),
  revenue: toNumber(raw.revenue),
  commission: toNumber(raw.commission),
  earnings: toNumber(raw.earnings),
  fulfilmentRate: toNumber(raw.fulfilmentRate),
});

type RawVendorPerformanceList = Partial<
  Record<keyof Omit<AnalyticsVendorPerformanceListData, 'itemList'>, unknown>
> & {
  vendorList?: unknown;
};

export const toVendorPerformanceList = (raw: RawVendorPerformanceList = {}): AnalyticsVendorPerformanceListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.vendorList)
    ? raw.vendorList.filter(isObject).map(toVendorPerformance)
    : [],
});

export const toCustomerCohort = (raw: Record<string, unknown> = {}): AnalyticsCustomerCohortData => ({
  period: toString(raw.period),
  customers: toNumber(raw.customers),
  retained: toNumber(raw.retained),
  retentionRate: toNumber(raw.retentionRate),
  revenue: toNumber(raw.revenue),
});

export const toCustomerCohorts = (raw: Record<string, unknown> = {}): AnalyticsCustomerCohortsData => ({
  from: toString(raw.from),
  to: toString(raw.to),
  series: Array.isArray(raw.series) ? raw.series.filter(isObject).map(toCustomerCohort) : [],
});

export const toAbandonedCart = (raw: Record<string, unknown> = {}): AnalyticsAbandonedCartData => ({
  cartId: toString(raw.cartId),
  customerId: toString(raw.customerId),
  customerName: toString(raw.customerName),
  email: toString(raw.email),
  items: toNumber(raw.items),
  value: toNumber(raw.value),
  abandonedAt: toString(raw.abandonedAt),
});

type RawAbandonedCartsList = Partial<
  Record<keyof Omit<AnalyticsAbandonedCartsListData, 'itemList' | 'totalValue'>, unknown>
> & {
  cartList?: unknown;
  totalValue?: unknown;
};

export const toAbandonedCartsList = (raw: RawAbandonedCartsList = {}): AnalyticsAbandonedCartsListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.cartList)
    ? raw.cartList.filter(isObject).map(toAbandonedCart)
    : [],
  totalValue: toNumber(raw.totalValue),
});

export const toSearchTerm = (raw: Record<string, unknown> = {}): AnalyticsSearchTermData => ({
  term: toString(raw.term),
  searches: toNumber(raw.searches),
  results: toNumber(raw.results),
  conversions: toNumber(raw.conversions),
  conversionRate: toNumber(raw.conversionRate),
});

type RawSearchTermList = Partial<
  Record<keyof Omit<AnalyticsSearchTermListData, 'itemList'>, unknown>
> & {
  termList?: unknown;
};

export const toSearchTermList = (raw: RawSearchTermList = {}): AnalyticsSearchTermListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.termList)
    ? raw.termList.filter(isObject).map(toSearchTerm)
    : [],
});

export const toZeroResultSearch = (raw: Record<string, unknown> = {}): AnalyticsZeroResultSearchData => ({
  term: toString(raw.term),
  searches: toNumber(raw.searches),
});

type RawZeroResultSearchList = Partial<
  Record<keyof Omit<AnalyticsZeroResultSearchListData, 'itemList'>, unknown>
> & {
  termList?: unknown;
};

export const toZeroResultSearchList = (raw: RawZeroResultSearchList = {}): AnalyticsZeroResultSearchListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.termList)
    ? raw.termList.filter(isObject).map(toZeroResultSearch)
    : [],
});

export const toRevenueReport = (raw: Record<string, unknown> = {}): AnalyticsRevenueReportData => ({
  from: toString(raw.from),
  to: toString(raw.to),
  groupBy: toString(raw.groupBy),
  totalRevenue: toNumber(raw.totalRevenue),
  totalOrders: toNumber(raw.totalOrders),
  averageOrderValue: toNumber(raw.averageOrderValue),
  series: Array.isArray(raw.series)
    ? raw.series.filter(isObject).map((item) => ({
        date: toString(item.date),
        revenue: toNumber(item.revenue),
        orders: toNumber(item.orders),
      }))
    : [],
});