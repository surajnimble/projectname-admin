'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type {
  ApiRequest,
  ConversationListData,
  MessageListData,
} from '@/lib/api/contract';

export function useConversations() {
  const [data, setData] = useState<ConversationListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
    unreadTotal: 0,
  } as ConversationListData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');
  const [filters, setFiltersState] = useState<Record<string, string>>({});
  const debouncedSearch = useMemo(() => search, [search]);

  const query = useMemo(
    () => ({ page, search: debouncedSearch, filters }),
    [page, debouncedSearch, filters],
  );

  const load = useCallback(async () => {
    try {
      const res = await apiService.getConversations({
        page: query.page,
        limit: 20,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setData(res.data as ConversationListData);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setIsLoading(true);
      void load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setFilters = useCallback((values: Record<string, string>) => {
    setFiltersState(values);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return {
    data,
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

export function useConversationMessages(conversationId: string) {
  const [data, setData] = useState<MessageListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 50,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const res = await apiService.getMessages(conversationId, {
        page,
        limit: 50,
      });
      if (res.status) {
        setData(res.data as MessageListData);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, page]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setIsLoading(true);
      void load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const sendMessage = useCallback(
    async (body: ApiRequest) => {
      const res = await apiService.sendMessage(conversationId, body);
      if (res.status) {
        await load();
        return true;
      }
      return false;
    },
    [conversationId, load],
  );

  const markRead = useCallback(
    async () => {
      await apiService.markConversationRead(conversationId, {});
      await load();
    },
    [conversationId, load],
  );

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    page,
    setPage: changePage,
    sendMessage,
    markRead,
    refresh,
  };
}
