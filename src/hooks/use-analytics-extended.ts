'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type {
  AnalyticsAbandonedCartListData,
  AnalyticsAppVersionListData,
  AnalyticsCrashListData,
  AnalyticsCustomerCohortsData,
  AnalyticsFunnelListData,
  AnalyticsFunnelReportData,
  AnalyticsRevenueReportData,
  AnalyticsConversionListData,
  AnalyticsSearchTermListData,
  AnalyticsVendorPerformanceListData,
} from '@/lib/api/contract';

const emptyPage = <T,>() => ({
  totalRecord: 0,
  totalPage: 0,
  currentPage: 1,
  limit: 10,
  hasNext: false,
  hasPrevious: false,
  nextPage: 0,
  previousPage: 0,
  itemList: [] as T[],
});

export function useAnalyticsExtended() {
  const [vendorPage, setVendorPage] = useState(1);
  const [abandonedPage, setAbandonedPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [zeroResultsPage, setZeroResultsPage] = useState(1);
  const [crashPage, setCrashPage] = useState(1);
  const [vendors, setVendors] = useState<AnalyticsVendorPerformanceListData>(emptyPage());
  const [cohorts, setCohorts] = useState<AnalyticsCustomerCohortsData>({ from: '', to: '', series: [] });
  const [abandoned, setAbandoned] = useState<AnalyticsAbandonedCartListData>({ ...emptyPage(), totalValue: 0 });
  const [searchTerms, setSearchTerms] = useState<AnalyticsSearchTermListData>(emptyPage());
  const [zeroResults, setZeroResults] = useState<AnalyticsSearchTermListData>(emptyPage());
  const [crashes, setCrashes] = useState<AnalyticsCrashListData>(emptyPage());
  const [versions, setVersions] = useState<AnalyticsAppVersionListData>(emptyPage());
  const [conversions, setConversions] = useState<AnalyticsConversionListData>(emptyPage());
  const [revenue, setRevenue] = useState<AnalyticsRevenueReportData>({
    from: '', to: '', groupBy: 'day', totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, series: [],
  });
  const [funnels, setFunnels] = useState<AnalyticsFunnelListData>({ funnelCount: 0, funnelList: [] });
  const [funnelReport, setFunnelReport] = useState<AnalyticsFunnelReportData>({
    funnelId: '', name: '', from: '', to: '', overallConversionRate: 0, stepList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const refresh = useCallback(async () => {
    setIsFetching(true);
    setError('');
    const requests = await Promise.all([
      apiService.getAnalyticsVendorPerformance({ page: vendorPage, limit: 10 }),
      apiService.getAnalyticsCustomerCohorts({ days: 30 }),
      apiService.getAnalyticsAbandonedCarts({ page: abandonedPage, limit: 10, minAgeHours: 24 }),
      apiService.getAnalyticsSearchTerms({ page: searchPage, limit: 10 }),
      apiService.getAnalyticsZeroResultSearches({ page: zeroResultsPage, limit: 10 }),
      apiService.getAnalyticsCrashes({ page: crashPage, limit: 10, days: 30 }),
      apiService.getAnalyticsAppVersions({ days: 30 }),
      apiService.getAnalyticsRevenueReport({ days: 30, groupBy: 'day' }),
      apiService.getAnalyticsConversions({ days: 30 }),
      apiService.getAnalyticsFunnels({}),
    ]);

    const [vendorRes, cohortRes, abandonedRes, searchRes, zeroRes, crashRes, versionRes, revenueRes, conversionRes, funnelRes] = requests;
    const failed = requests.find((item) => !item.status);
    if (failed) setError(failed.message || 'Some analytics reports could not be loaded.');

    if (vendorRes.status) setVendors(vendorRes.data);
    if (cohortRes.status) setCohorts(cohortRes.data);
    if (abandonedRes.status) setAbandoned(abandonedRes.data);
    if (searchRes.status) setSearchTerms(searchRes.data);
    if (zeroRes.status) setZeroResults(zeroRes.data);
    if (crashRes.status) setCrashes(crashRes.data);
    if (versionRes.status) setVersions(versionRes.data);
    if (revenueRes.status) setRevenue(revenueRes.data);
    if (conversionRes.status) setConversions(conversionRes.data);
    if (funnelRes.status) {
      setFunnels(funnelRes.data);
      const firstFunnel = funnelRes.data.funnelList[0];
      if (firstFunnel?.slug) {
        const reportRes = await apiService.getAnalyticsFunnel({ funnel: firstFunnel.slug, days: 30 });
        if (reportRes.status) setFunnelReport(reportRes.data);
      } else {
        setFunnelReport({ funnelId: '', name: '', from: '', to: '', overallConversionRate: 0, stepList: [] });
      }
    }

    setIsLoading(false);
    setIsFetching(false);
  }, [vendorPage, abandonedPage, searchPage, zeroResultsPage, crashPage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const exportCsv = useCallback(async () => {
    setIsExporting(true);
    setActionError('');
    try {
      const response = await apiService.exportAnalytics({ days: 30, limit: 50000 });
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'analytics.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return true;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const createFunnel = useCallback(async (body: Record<string, unknown>) => {
    if (isMutating) return false;
    setIsMutating(true);
    setActionError('');
    try {
      const response = await apiService.createAnalyticsFunnel(body);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await refresh();
      return true;
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, refresh]);

  const updateFunnel = useCallback(async (id: string, body: Record<string, unknown>) => {
    if (isMutating) return false;
    setIsMutating(true);
    setActionError('');
    try {
      const response = await apiService.updateAnalyticsFunnel(id, body);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await refresh();
      return true;
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, refresh]);

  return {
    vendorPage, setVendorPage, abandonedPage, setAbandonedPage, searchPage, setSearchPage,
    zeroResultsPage, setZeroResultsPage, crashPage, setCrashPage,
    vendors, cohorts, abandoned, searchTerms, zeroResults, crashes, versions, conversions,
    revenue, funnels, funnelReport, isLoading, isFetching, isExporting, isMutating, error, actionError,
    refresh, exportCsv, createFunnel, updateFunnel,
  };
}
