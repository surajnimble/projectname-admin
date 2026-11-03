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
  AnalyticsSessionData,
  AnalyticsSessionListData,
  AnalyticsTrafficSourceData,
  AnalyticsVisitorData,
  AnalyticsAppVersionData,
  PageData,
  ProductPerformanceData,
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
  const [revenueReport, setRevenueReport] = useState<PageData<AnalyticsConversionData>>({
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
  const [productPerformance, setProductPerformance] = useState<ProductPerformanceData[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<ProductPerformanceData[]>([]);
  const [customerCohorts, setCustomerCohorts] = useState<ProductPerformanceData[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<ProductPerformanceData[]>([]);
  const [searchTerms, setSearchTerms] = useState<ProductPerformanceData[]>([]);
  const [zeroResultSearches, setZeroResultSearches] = useState<ProductPerformanceData[]>([]);
  const [realtime, setRealtime] = useState<AnalyticsOverviewData>(toAnalyticsOverview());
  const [crashes, setCrashes] = useState<AnalyticsCrashData[]>([]);
  const [appVersions, setAppVersions] = useState<AnalyticsAppVersionData[]>([]);
  const [funnelList, setFunnelList] = useState<AnalyticsFunnelStepData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
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
      const res = await apiService.getAnalyticsOverview({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setOverview(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load analytics overview');
    }
  }, [query]);

  const fetchVisitors = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsVisitors({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setVisitors(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load visitors');
    }
  }, [query]);

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

  const fetchUniqueVisitors = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsUniqueVisitors({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setUniqueVisitors(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load unique visitors');
    }
  }, [query]);

  const fetchPageViews = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsPageViews({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setTopPages(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load page views');
    }
  }, [query]);

  const fetchTrafficSources = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsTrafficSources({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setTrafficSources(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load traffic sources');
    }
  }, [query]);

  const fetchDeviceBreakdown = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsDeviceBreakdown({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setDeviceBreakdown(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load device breakdown');
    }
  }, [query]);

  const fetchGeoBreakdown = useCallback(async () => {
    try {
      const res = await apiService.getAnalyticsGeoBreakdown({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setGeoBreakdown(res.data.itemList);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load geo breakdown');
    }
  }, [query]);

  useEffect(() => {
    let active = true;
    void (async () => {
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
      if (active) {
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [query, fetchOverview, fetchVisitors, fetchUniqueVisitors, fetchPageViews, fetchTrafficSources, fetchDeviceBreakdown, fetchGeoBreakdown, fetchSessions, fetchRealtime, fetchProductPerformance]);

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
    setIsLoading(true);
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
    setIsLoading(false);
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
