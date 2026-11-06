'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { ApiRequest } from '@/lib/api/contract';
import type { FeatureFlagsData, MaintenanceStatusData, SettingListData } from '@/lib/api/contract';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  allowedIps: string[];
}

export function useSettings() {
  const [data, setData] = useState<SettingListData>(() => ({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 50,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  }));
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [orderRequireAdminConfirmation, setOrderRequireAdminConfirmation] = useState(true);
  const [isOrderReviewSettingLoading, setIsOrderReviewSettingLoading] = useState(true);
  const [orderReviewSettingError, setOrderReviewSettingError] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>({
    enabled: false,
    message: '',
    allowedIps: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');
  const [category, setCategory] = useState('all');
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => ({ page, search: debouncedSearch, category }),
    [page, debouncedSearch, category],
  );

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const req: ApiRequest = { page, limit: 50 };
      if (query.search) req.search = query.search;
      if (query.category !== 'all') req.category = query.category;
      const res = await apiService.getSettings(req);
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const fetchOrderReviewSetting = useCallback(async () => {
    setIsOrderReviewSettingLoading(true);
    try {
      const res = await apiService.getSettings({ page: 1, limit: 100, category: 'order' });
      if (res.status) {
        const setting = res.data.itemList.find((item) => item.key === 'orderRequireAdminConfirmation');
        setOrderRequireAdminConfirmation(setting ? setting.value === true : true);
        setOrderReviewSettingError('');
      } else {
        setOrderReviewSettingError(res.message);
      }
    } catch {
      setOrderReviewSettingError('Failed to load order review setting');
    } finally {
      setIsOrderReviewSettingLoading(false);
    }
  }, []);

  const updateOrderReviewSetting = useCallback(async (enabled: boolean) => {
    const previous = orderRequireAdminConfirmation;
    setOrderRequireAdminConfirmation(enabled);
    setIsActioning(true);
    try {
      const res = await apiService.updateSetting({
        key: 'orderRequireAdminConfirmation',
        value: enabled,
        category: 'order',
        isPublic: false,
      });
      if (res.status) {
        await fetchOrderReviewSetting();
        return true;
      }
      setOrderRequireAdminConfirmation(previous);
      setOrderReviewSettingError(res.message);
      return false;
    } catch {
      setOrderRequireAdminConfirmation(previous);
      setOrderReviewSettingError('Failed to update order review setting');
      return false;
    } finally {
      setIsActioning(false);
    }
  }, [fetchOrderReviewSetting, orderRequireAdminConfirmation]);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await apiService.getFeatureFlags();
      if (res.status) {
        setFlags(res.data as unknown as Record<string, boolean>);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load feature flags');
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getMaintenanceStatus();
      if (res.status) {
        const s = res.data as unknown as MaintenanceStatusData;
        setStatus({
          enabled: s.enabled,
          message: s.message,
          allowedIps: s.allowedIps,
        });
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load maintenance status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key: string, value: string) => {
    setIsActioning(true);
    try {
      const res = await apiService.updateSetting({ key, value });
      if (res.status) {
        await fetchSettings();
        return true;
      }
      setError(res.message);
      return false;
    } catch {
      setError('Failed to update setting');
      return false;
    } finally {
      setIsActioning(false);
    }
  }, [fetchSettings]);

  const resetSettings = useCallback(async () => {
    setIsActioning(true);
    try {
      const res = await apiService.resetSettings();
      if (res.status) {
        await fetchSettings();
        return true;
      }
      setError(res.message);
      return false;
    } catch {
      setError('Failed to reset settings');
      return false;
    } finally {
      setIsActioning(false);
    }
  }, [fetchSettings]);

  const toggleFlag = useCallback(async (key: string, current: boolean) => {
    const next = !current;
    setFlags((prev) => ({ ...prev, [key]: next }));
    setIsActioning(true);
    try {
      const res = await apiService.toggleFeature({ key, enabled: next });
      if (!res.status) {
        setFlags((prev) => ({ ...prev, [key]: current }));
        setError(res.message);
      }
    } catch {
      setFlags((prev) => ({ ...prev, [key]: current }));
      setError('Failed to toggle feature');
    } finally {
      setIsActioning(false);
    }
  }, []);

  const saveMaintenance = useCallback(async (values: { enabled: boolean; message: string; allowedIps: string[] }) => {
    setIsActioning(true);
    try {
      const res = await apiService.updateMaintenance(values);
      if (res.status) {
        await fetchStatus();
        return true;
      }
      setError(res.message);
      return false;
    } catch {
      setError('Failed to update maintenance');
      return false;
    } finally {
      setIsActioning(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    void (async () => {
      await fetchSettings();
      await fetchFlags();
      await fetchStatus();
      await fetchOrderReviewSetting();
    })();
  }, [fetchSettings, fetchFlags, fetchStatus, fetchOrderReviewSetting]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setFilters = useCallback((values: Record<string, string>) => {
    // category is handled separately
  }, []);

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchSettings();
    await fetchFlags();
    await fetchStatus();
    await fetchOrderReviewSetting();
    setIsLoading(false);
  }, [fetchSettings, fetchFlags, fetchStatus, fetchOrderReviewSetting]);

  return {
    data,
    flags,
    orderRequireAdminConfirmation,
    isOrderReviewSettingLoading,
    orderReviewSettingError,
    status,
    isLoading,
    error,
    isActioning,
    page,
    search,
    category,
    setPage: changePage,
    setSearch,
    setFilters,
    setCategory,
    refresh,
    fetchSettings,
    fetchFlags,
    fetchStatus,
    updateSetting,
    resetSettings,
    toggleFlag,
    updateOrderReviewSetting,
    saveMaintenance,
  };
}
