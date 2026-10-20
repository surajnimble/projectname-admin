import { useCallback, useEffect, useState } from 'react';
import { VENDOR_PAGE_SIZE } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, KycDocumentListData } from '@/lib/api/contract';
import { toKycDocumentList } from '@/types/vendor';

export type DocumentFilter = 'all' | 'verified' | 'pending';

export function useVendorDocuments() {
  const [data, setData] = useState<KycDocumentListData>(toKycDocumentList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [filter, setFilterState] = useState<DocumentFilter>('all');
  const [docType, setDocTypeState] = useState('');
  const [search, setSearchState] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const query = useCallback(
    () => ({
      page,
      limit: VENDOR_PAGE_SIZE,
      ...(filter === 'all' ? {} : { isVerified: filter === 'verified' }),
      ...(docType ? { docType } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch, docType, filter, page],
  );

  const apply = useCallback((response: BaseResponse<KycDocumentListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void apiService.getVendorDocuments(query()).then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getVendorDocuments(query()));
  }, [apply, query]);

  const setFilter = useCallback((next: DocumentFilter) => {
    setFilterState(next);
    setPage(1);
  }, []);

  const setDocType = useCallback((next: string) => {
    setDocTypeState(next);
    setPage(1);
  }, []);

  const setSearch = useCallback((next: string) => {
    setSearchState(next);
    setPage(1);
  }, []);

  const verifyDocument = useCallback(
    async (documentId: string, isVerified: boolean, remark?: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.verifyVendorDocument(documentId, { isVerified, remark });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    filter,
    docType,
    search,
    page,
    setFilter,
    setDocType,
    setSearch,
    setPage,
    refresh,
    verifyDocument,
  };
}
