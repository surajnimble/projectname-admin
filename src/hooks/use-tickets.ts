'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { ApiRequest } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export function useTickets() {
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
  const [categories, setCategories] = useState<any>({
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
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => ({ page, search: debouncedSearch, filters }),
    [page, debouncedSearch, filters],
  );

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getTickets({
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
      setError('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiService.getTicketCategories();
      if (res.status) {
        setCategories(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load categories');
    }
  }, []);

  const createTicket = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.createTicket(body as any);
        if (res.status) {
          await fetchTickets();
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to create ticket');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [fetchTickets],
  );

  const replyTicket = useCallback(
    async (id: string, message: string, isInternal: boolean) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.replyTicket(id, { message, isInternal });
        if (res.status) {
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to reply');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const updateTicketStatus = useCallback(
    async (id: string, status: string, remark: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.updateTicketStatus(id, { status, remark });
        if (res.status) {
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to update status');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const assignTicket = useCallback(
    async (id: string, assignedToId: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.assignTicket(id, { assignedToId });
        if (res.status) {
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to assign');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const closeTicket = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.closeTicket(id);
        if (res.status) {
          setData((prev: any) => ({
            ...prev,
            itemList: prev.itemList.map((t: any) =>
              t.ticketId === id ? { ...t, status: 'CLOSED' } : t,
            ),
          }));
        } else {
          setActionError(res.message);
        }
      } catch {
        setActionError('Failed to close ticket');
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const deleteTicket = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.deleteTicket(id);
        if (res.status) {
          setData((prev: any) => ({
            ...prev,
            itemList: prev.itemList.filter((t: any) => t.ticketId !== id),
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

  useEffect(() => {
    void fetchTickets();
    void fetchCategories();
  }, [query, fetchTickets, fetchCategories]);

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
    await fetchTickets();
    await fetchCategories();
    setIsLoading(false);
  }, [fetchTickets, fetchCategories]);

  return {
    data,
    categories,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    filters,
    setPage: changePage,
    setSearch,
    setFilters,
    refresh,
    createTicket,
    replyTicket,
    updateTicketStatus,
    assignTicket,
    closeTicket,
    deleteTicket,
  };
}
