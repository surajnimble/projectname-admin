import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toKycDocumentList } from '@/types/vendor';
import { useVendorDocuments } from './use-vendor-documents';

const getVendorDocuments = vi.fn();
const verifyVendorDocument = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getVendorDocuments: (query: unknown) => getVendorDocuments(query),
    verifyVendorDocument: (id: string, body: unknown) => verifyVendorDocument(id, body),
  },
}));

const list = toKycDocumentList({
  totalRecord: 1,
  currentPage: 1,
  limit: 10,
  documentList: [{ documentId: 'd1', docType: 'GST', vendorData: { shopName: 'Demo Shop' } }],
});

describe('useVendorDocuments', () => {
  beforeEach(() => {
    getVendorDocuments.mockReset();
    verifyVendorDocument.mockReset();
  });

  it('loads the documents without a filter', async () => {
    getVendorDocuments.mockResolvedValue({ status: true, message: 'ok', data: list });

    const { result } = renderHook(() => useVendorDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getVendorDocuments).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.current.data.itemList).toHaveLength(1);
  });

  it('filters the documents by verification state', async () => {
    getVendorDocuments.mockResolvedValue({ status: true, message: 'ok', data: list });

    const { result } = renderHook(() => useVendorDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.setFilter('verified');

    await waitFor(() =>
      expect(getVendorDocuments).toHaveBeenCalledWith({ page: 1, limit: 10, isVerified: true }),
    );
  });

  it('verifies a document and refreshes the list', async () => {
    getVendorDocuments.mockResolvedValue({ status: true, message: 'ok', data: list });
    verifyVendorDocument.mockResolvedValue({ status: true, message: 'ok', data: {} });

    const { result } = renderHook(() => useVendorDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.verifyDocument('d1', false, 'Blurry scan');

    expect(done).toBe(true);
    expect(verifyVendorDocument).toHaveBeenCalledWith('d1', {
      isVerified: false,
      remark: 'Blurry scan',
    });
    expect(getVendorDocuments).toHaveBeenCalledTimes(2);
  });
});
