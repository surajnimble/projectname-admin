'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';

export function useAnalytics() {
  const [overview, setOverview] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    conversionRate: 0,
    avgOrderValue: 0,
  });
  const [visitors, setVisitors] = useState<any[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [trafficSources, setTrafficSources] = useState<any[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<any[]>([]);
  const [geoBreakdown, setGeoBreakdown] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any>({
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
  const [funnel, setFunnel] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [revenueReport, setRevenueReport] = useState<any>({
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
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<any[]>([]);
  const [customerCohorts, setCustomerCohorts] = useState<any[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [zeroResultSearches, setZeroResultSearches] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any>(null);
  const [crashes, setCrashes] = useState<any[]>([]);
  const [appVersions, setAppVersions] = useState<any[]>([]);
  const [funnelList, setFunnelList] = useState<any[]>([]);

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
      } as any);
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
      } as any);
      if (res.status) {
        setVisitors((res.data as any).itemList || (Array.isArray(res.data) ? res.data : []));
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
      } as any);
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
      } as any);
      if (res.status) {
        setProductPerformance((res.data as any).itemList || (Array.isArray(res.data) ? res.data : []));
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
      } as any);
      if (res.status) {
        setUniqueVisitors((res.data as any).itemList || (Array.isArray(res.data) ? res.data : []));
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
      } as any);
      if (res.status) {
        setTopPages((res.data as any).itemList || (Array.isArray(res.data) ? res.data : []));
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
      } as any);
      if (res.status) {
        setTrafficSources((res.data as any).itemList || (Array.isArray(res.data) ? res.data : []));
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
      } as any);
      if (res.status) {
        setDeviceBreakdown((res.data as any).itemList || (Array.isArray(res.data) ? res.data : []));
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
      } as any);
      if (res.status) {
        setRevenueReport((res.data as any).itemList ? res.data : { ...revenueReport, itemList: Array.isArray(res.data) ? res.data : [] });
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
