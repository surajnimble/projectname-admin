'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import { toAnalyticsOverview } from '@/types/analytics';
import type {
  AnalyticsConversionData,
  AnalyticsCrashData,
  AnalyticsDeviceData,
  AnalyticsFunnelStepData,
  AnalyticsGeoData,
  AnalyticsOverviewData,
  AnalyticsPageViewData,
  AnalyticsRevenueReportData,
  AnalyticsSessionData,
  AnalyticsSessionListData,
  AnalyticsTrafficSourceData,
  AnalyticsVisitorData,
  AnalyticsAppVersionData,
  PageData,
  ProductPerformanceData,
  AnalyticsVendorPerformanceData,
  AnalyticsCustomerCohortData,
  AnalyticsAbandonedCartData,
  AnalyticsSearchTermData,
  AnalyticsZeroResultSearchData,
} from '@/lib/api/contract';

export function useAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverviewData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    conversionRate: 0,
    avgOrderValue: 0,
  });
  const [visitors, setVisitors] = useState<AnalyticsVisitorData[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<AnalyticsVisitorData[]>([]);
  const [pageViews, setPageViews] = useState<AnalyticsPageViewData[]>([]);
  const [topPages, setTopPages] = useState<AnalyticsPageViewData[]>([]);
  const [trafficSources, setTrafficSources] = useState<AnalyticsTrafficSourceData[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<AnalyticsDeviceData[]>([]);
  const [geoBreakdown, setGeoBreakdown] = useState<AnalyticsGeoData[]>([]);
  const [sessions, setSessions] = useState<AnalyticsSessionData[]>([]);
  const [sessionsList, setSessionsList] = useState<AnalyticsSessionListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 10,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [funnel, setFunnel] = useState<AnalyticsFunnelStepData[]>([]);
  const [conversions, setConversions] = useState<AnalyticsConversionData[]>([]);
  const [revenueReport, setRevenueReport] = useState<AnalyticsRevenueReportData>({
    from: '',
    to: '',
    groupBy: '',
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    series: [],
  });
  const [productPerformance, setProductPerformance] = useState<ProductPerformanceData[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<AnalyticsVendorPerformanceData[]>([]);
  const [customerCohorts, setCustomerCohorts] = useState<AnalyticsCustomerCohortData[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AnalyticsAbandonedCartData[]>([]);
  const [searchTerms, setSearchTerms] = useState<AnalyticsSearchTermData[]>([]);
  const [zeroResultSearches, setZeroResultSearches] = useState<AnalyticsZeroResultSearchData[]>([]);
  const [realtime, setRealtime] = useState<AnalyticsOverviewData>(toAnalyticsOverview());
  const [crashes, setCrashes] = useState<AnalyticsCrashData[]>([]);
  const [appVersions, setAppVersions] = useState<AnalyticsAppVersionData[]>([]);
  const [funnelList, setFunnelList] = useState<AnalyticsFunnelStepData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');
  const [filters, setFiltersState] = useState<Record<string, string>>({});
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => ({ page, search: debouncedSearch, filters }),
    [page, debouncedSearch, filters],
  );

  const fetchOverview = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsOverview({});
      if (res.status) {
        setOverview(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load analytics overview');
    }
  }, []);

  const fetchVisitors = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsVisitors({});
      if (res.status) {
        setVisitors(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load visitors');
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsSessions({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setSessionsList(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load sessions');
    }
  }, [query]);

  const fetchRealtime = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsRealtime();
      if (res.status) {
        setRealtime(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load realtime stats');
    }
  }, []);

  const fetchProductPerformance = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsProductPerformance({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setProductPerformance(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load product performance');
    }
  }, [query]);

  const fetchVendorPerformance = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsVendorPerformance({
        page: query.page,
        limit: 10,
        ...query.filters,
      });
      if (res.status) {
        setVendorPerformance(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load vendor performance');
    }
  }, [query]);

  const fetchCustomerCohorts = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsCustomerCohorts({ ...query.filters });
      if (res.status) {
        setCustomerCohorts(res.data.series);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load customer cohorts');
    }
  }, [query]);

  const fetchAbandonedCarts = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsAbandonedCarts({
        page: query.page,
        limit: 10,
        ...query.filters,
      });
      if (res.status) {
        setAbandonedCarts(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load abandoned carts');
    }
  }, [query]);

  const fetchSearchTerms = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsSearchTerms({
        page: query.page,
        limit: 10,
        ...query.filters,
      });
      if (res.status) {
        setSearchTerms(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load search terms');
    }
  }, [query]);

  const fetchZeroResultSearches = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsZeroResultSearches({
        page: query.page,
        limit: 10,
        ...query.filters,
      });
      if (res.status) {
        setZeroResultSearches(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load zero result searches');
    }
  }, [query]);

  const fetchCrashes = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsCrashes({
        page: query.page,
        limit: 10,
        ...query.filters,
      });
      if (res.status) {
        setCrashes(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load crashes');
    }
  }, [query]);

  const fetchAppVersions = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsAppVersions({ ...query.filters });
      if (res.status) {
        setAppVersions(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load app versions');
    }
  }, [query]);

  const fetchRevenueReport = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsRevenueReport({ ...query.filters });
      if (res.status) {
        setRevenueReport(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load revenue report');
    }
  }, [query]);

  const fetchUniqueVisitors = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsUniqueVisitors({});
      if (res.status) {
        setUniqueVisitors(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load unique visitors');
    }
  }, []);

  const fetchPageViews = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsPageViews({});
      if (res.status) {
        setTopPages(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load page views');
    }
  }, []);

  const fetchTrafficSources = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsTrafficSources({});
      if (res.status) {
        setTrafficSources(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load traffic sources');
    }
  }, []);

  const fetchDeviceBreakdown = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsDeviceBreakdown({});
      if (res.status) {
        setDeviceBreakdown(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load device breakdown');
    }
  }, []);

  const fetchGeoBreakdown = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsGeoBreakdown({});
      if (res.status) {
        setGeoBreakdown(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load geo breakdown');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const isInitial = isLoading;
    void (async () => {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      await fetchOverview();
      await fetchVisitors();
      await fetchUniqueVisitors();
      await fetchPageViews();
      await fetchTrafficSources();
      await fetchDeviceBreakdown();
      await fetchGeoBreakdown();
      await fetchSessions();
      await fetchRealtime();
      await fetchProductPerformance();
      await fetchVendorPerformance();
      await fetchCustomerCohorts();
      await fetchAbandonedCarts();
      await fetchSearchTerms();
      await fetchZeroResultSearches();
      await fetchCrashes();
      await fetchAppVersions();
      await fetchRevenueReport();
      if (active) {
        setIsLoading(false);
        setIsFetching(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [query, fetchOverview, fetchVisitors, fetchUniqueVisitors, fetchPageViews, fetchTrafficSources, fetchDeviceBreakdown, fetchGeoBreakdown, fetchSessions, fetchRealtime, fetchProductPerformance, fetchVendorPerformance, fetchCustomerCohorts, fetchAbandonedCarts, fetchSearchTerms, fetchZeroResultSearches, fetchCrashes, fetchAppVersions, fetchRevenueReport, isLoading]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setFilters = useCallback((values: Record<string, string>) => {
    setFiltersState(values);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    await fetchOverview();
    await fetchVisitors();
    await fetchUniqueVisitors();
    await fetchPageViews();
    await fetchTrafficSources();
    await fetchDeviceBreakdown();
    await fetchGeoBreakdown();
    await fetchSessions();
    await fetchRealtime();
    await fetchProductPerformance();
    await fetchVendorPerformance();
    await fetchCustomerCohorts();
    await fetchAbandonedCarts();
    await fetchSearchTerms();
    await fetchZeroResultSearches();
    await fetchCrashes();
    await fetchAppVersions();
    await fetchRevenueReport();
    setIsLoading(false);
    setIsFetching(false);
  }, [
    fetchOverview,
    fetchVisitors,
    fetchUniqueVisitors,
    fetchPageViews,
    fetchTrafficSources,
    fetchDeviceBreakdown,
    fetchGeoBreakdown,
    fetchSessions,
    fetchRealtime,
    fetchProductPerformance,
    fetchVendorPerformance,
    fetchCustomerCohorts,
    fetchAbandonedCarts,
    fetchSearchTerms,
    fetchZeroResultSearches,
    fetchCrashes,
    fetchAppVersions,
    fetchRevenueReport,
  ]);

  return {
    overview,
    visitors,
    uniqueVisitors,
    pageViews,
    topPages,
    trafficSources,
    deviceBreakdown,
    geoBreakdown,
    sessions: sessionsList.itemList || [],
    sessionsList,
    funnel,
    conversions,
    revenueReport,
    productPerformance,
    vendorPerformance,
    customerCohorts,
    abandonedCarts,
    searchTerms,
    zeroResultSearches,
    realtime,
    crashes,
    appVersions,
    funnelList,
    isLoading,
    isFetching,
    error,
    page,
    search,
    filters,
    setPage: changePage,
    setSearch,
    setFilters,
    refresh,
  };
}
