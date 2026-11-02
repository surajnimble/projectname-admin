'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { ApiRequest } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export function useNotifications() {
  const [data, setData] = useState<any>({
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
  const [templates, setTemplates] = useState<any>({
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');
  const [filters, setFiltersState] = useState<Record<string, string>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => ({ page, search: debouncedSearch, filters }),
    [page, debouncedSearch, filters],
  );

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getNotifications({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      } as any);
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await apiService.getNotificationTemplates();
      if (res.status) {
        setTemplates(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load templates');
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiService.getNotificationsUnreadCount();
      if (res.status) {
        setUnreadCount(toNumber(res.data.unreadCount));
      }
    } catch {
      // ignore
    }
  }, []);

  const markRead = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.markNotificationRead(id);
        if (res.status) {
          setData((prev: any) => ({
            ...prev,
            itemList: prev.itemList.map((n: any) =>
              n.notificationId === id ? { ...n, isRead: true } : n,
            ),
          }));
          setUnreadCount((prev: any) => Math.max(0, prev - 1));
        } else {
          setActionError(res.message);
        }
      } catch {
        setActionError('Failed to mark read');
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    setIsActioning(true);
    setActionError('');
    try {
      const res = await apiService.markAllNotificationsRead();
      if (res.status) {
        setData((prev: any) => ({
          ...prev,
          itemList: prev.itemList.map((n: any) => ({ ...n, isRead: true })),
        }));
        setUnreadCount(0);
      } else {
        setActionError(res.message);
      }
    } catch {
      setActionError('Failed to mark all read');
    } finally {
      setIsActioning(false);
    }
  }, []);

  const deleteNotification = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.deleteNotification(id);
        if (res.status) {
          setData((prev: any) => ({
            ...prev,
            itemList: prev.itemList.filter((n: any) => n.notificationId !== id),
            totalRecord: Math.max(0, prev.totalRecord - 1),
          }));
        } else {
          setActionError(res.message);
        }
      } catch {
        setActionError('Failed to delete');
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const broadcastNotification = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.broadcastNotification(body as any);
        if (res.status) {
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to broadcast');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const createTemplate = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.createNotificationTemplate(body as any);
        if (res.status) {
          await fetchTemplates();
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to create template');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [fetchTemplates],
  );

  const updateTemplate = useCallback(
    async (id: string, body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.updateNotificationTemplate(id, body as any);
        if (res.status) {
          await fetchTemplates();
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to update template');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [fetchTemplates],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.deleteNotificationTemplate(id);
        if (res.status) {
          await fetchTemplates();
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to delete template');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [fetchTemplates],
  );

  useEffect(() => {
    void fetchNotifications();
    void fetchTemplates();
    void fetchUnreadCount();
  }, [query, fetchNotifications, fetchTemplates, fetchUnreadCount]);

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
    await fetchNotifications();
    await fetchTemplates();
    await fetchUnreadCount();
    setIsLoading(false);
  }, [fetchNotifications, fetchTemplates, fetchUnreadCount]);

  return {
    data,
    templates,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    filters,
    unreadCount,
    setPage: changePage,
    setSearch,
    setFilters,
    refresh,
    markRead,
    markAllRead,
    deleteNotification,
    broadcastNotification,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
