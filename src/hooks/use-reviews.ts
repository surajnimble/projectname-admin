'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { ApiRequest, QuestionListData, ReviewListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export function useReviews() {
  const [data, setData] = useState<ReviewListData>({
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

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getReviews({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const approveReview = useCallback(
    async (id: string): Promise<boolean> => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.approveReview(id);
        if (res.status) {
          setData((prev: ReviewListData) => ({
            ...prev,
            itemList: prev.itemList.map((r: ReviewListData['itemList'][number]) =>
              r.reviewId === id ? { ...r, isApproved: true, isRejected: false, status: 'APPROVED' } : r,
            ),
          }));
          return true;
        } else {
          setActionError(res.message);
          return false;
        }
      } catch {
        setActionError('Failed to approve');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const rejectReview = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.rejectReview(id, reason ? { reason } : {});
        if (res.status) {
          setData((prev: ReviewListData) => ({
            ...prev,
            itemList: prev.itemList.map((r: ReviewListData['itemList'][number]) =>
              r.reviewId === id ? { ...r, isRejected: true, isApproved: false, status: 'REJECTED' } : r,
            ),
          }));
          return true;
        } else {
          setActionError(res.message);
          return false;
        }
      } catch {
        setActionError('Failed to reject');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const replyReview = useCallback(
    async (id: string, reply: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.replyReview(id, { reply });
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

  useEffect(() => {
    void (async () => {
      await fetchReviews();
    })();
  }, [query, fetchReviews]);

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
    await fetchReviews();
    setIsLoading(false);
  }, [fetchReviews]);

  return {
    data,
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
    approveReview,
    rejectReview,
    replyReview,
  };
}

export function useQuestions() {
  const [data, setData] = useState<QuestionListData>({
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

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getQuestions({
        page: query.page,
        limit: 10,
        ...(query.search ? { search: query.search } : {}),
        ...query.filters,
      });
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const approveQuestion = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.approveQuestion(id);
        if (res.status) {
          setData((prev: QuestionListData) => ({
            ...prev,
            itemList: prev.itemList.map((q: QuestionListData['itemList'][number]) =>
              q.questionId === id ? { ...q, isApproved: true } : q,
            ),
          }));
          return true;
        } else {
          setActionError(res.message);
          return false;
        }
      } catch {
        setActionError('Failed to approve');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  const deleteQuestion = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.deleteQuestion(id);
        if (res.status) {
          setData((prev: QuestionListData) => ({
            ...prev,
            itemList: prev.itemList.filter((q: QuestionListData['itemList'][number]) => q.questionId !== id),
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

  const answerQuestion = useCallback(
    async (id: string, answer: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        const res = await apiService.answerQuestion(id, { answer });
        if (res.status) {
          return true;
        }
        setActionError(res.message);
        return false;
      } catch {
        setActionError('Failed to answer');
        return false;
      } finally {
        setIsActioning(false);
      }
    },
    [],
  );

  useEffect(() => {
    void (async () => {
      await fetchQuestions();
    })();
  }, [query, fetchQuestions]);

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
    await fetchQuestions();
    setIsLoading(false);
  }, [fetchQuestions]);

  return {
    data,
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
    approveQuestion,
    deleteQuestion,
    answerQuestion,
  };
}
