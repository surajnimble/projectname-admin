import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toVendor } from '@/types/vendor';
import { resetSeedStore } from '@/lib/api/seed-store';
import { useVendorDetail } from './use-vendor-detail';

const getVendorById = vi.fn();
const getVendorRatings = vi.fn();
const verifyVendorDocument = vi.fn();
const approveVendor = vi.fn();
const updateVendorCommission = vi.fn();
const rejectVendor = vi.fn();
const suspendVendor = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getVendorById: (id: string) => getVendorById(id),
    getVendorRatings: (id: string) => getVendorRatings(id),
    verifyVendorDocument: (id: string, body: unknown) => verifyVendorDocument(id, body),
    approveVendor: (id: string, body: unknown) => approveVendor(id, body),
    updateVendorCommission: (id: string, body: unknown) => updateVendorCommission(id, body),
    rejectVendor: (id: string, body: unknown) => rejectVendor(id, body),
    suspendVendor: (id: string, body: unknown) => suspendVendor(id, body),
  },
}));

const vendor = toVendor({
  vendorId: 'v1',
  shopName: 'Demo Shop',
  status: 'APPROVED',
  commissionRate: 10,
});

describe('useVendorDetail', () => {
  beforeEach(() => {
    resetSeedStore();
    getVendorById.mockReset();
    getVendorRatings.mockReset();
    verifyVendorDocument.mockReset();
    approveVendor.mockReset();
    updateVendorCommission.mockReset();
    rejectVendor.mockReset();
    suspendVendor.mockReset();
    getVendorRatings.mockResolvedValue({
      status: true,
      message: 'ok',
      data: { average: 4.5, total: 8, breakdownList: [] },
    });
  });

  it('loads the vendor of the route', async () => {
    getVendorById.mockResolvedValue({ status: true, message: 'ok', data: vendor });

    const { result } = renderHook(() => useVendorDetail('v1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getVendorById).toHaveBeenCalledWith('v1');
    expect(result.current.vendor.shopName).toBe('Demo Shop');
  });

  it('shows the API message when the vendor cannot be read', async () => {
    getVendorById.mockResolvedValue({ status: false, message: 'Forbidden.', data: toVendor() });

    const { result } = renderHook(() => useVendorDetail('v1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Forbidden.');
  });

  it('runs a commission update', async () => {
    getVendorById.mockResolvedValue({ status: true, message: 'ok', data: vendor });
    updateVendorCommission.mockResolvedValue({ status: true, message: 'ok', data: vendor });

    const { result } = renderHook(() => useVendorDetail('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('commission', { commissionRate: 15 });

    expect(done).toBe(true);
    expect(updateVendorCommission).toHaveBeenCalledWith('v1', { commissionRate: 15 });
  });

  it('reports a failed action', async () => {
    getVendorById.mockResolvedValue({ status: true, message: 'ok', data: vendor });
    suspendVendor.mockResolvedValue({ status: false, message: 'Not allowed.', data: toVendor() });

    const { result } = renderHook(() => useVendorDetail('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('suspend', { reason: 'Policy' });

    expect(done).toBe(false);
    await waitFor(() => expect(result.current.actionError).toBe('Not allowed.'));
  });

  it('verifies a KYC document', async () => {
    getVendorById.mockResolvedValue({ status: true, message: 'ok', data: vendor });
    verifyVendorDocument.mockResolvedValue({ status: true, message: 'ok', data: {} });

    const { result } = renderHook(() => useVendorDetail('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.verifyDocument('d1', true);

    expect(done).toBe(true);
    expect(verifyVendorDocument).toHaveBeenCalledWith('d1', { isVerified: true, remark: undefined });
  });
});
