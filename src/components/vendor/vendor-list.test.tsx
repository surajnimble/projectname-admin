import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toVendorList } from '@/types/vendor';
import { resetSeedStore } from '@/lib/api/seed-store';
import { resetVendorsCache } from '@/hooks/use-vendors';
import { VendorList } from './vendor-list';

const getVendors = vi.fn();
const approveVendor = vi.fn();
const rejectVendor = vi.fn();
const suspendVendor = vi.fn();
const showSuccess = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getVendors: (query: unknown) => getVendors(query),
    approveVendor: (id: string, body: unknown) => approveVendor(id, body),
    rejectVendor: (id: string, body: unknown) => rejectVendor(id, body),
    suspendVendor: (id: string, body: unknown) => suspendVendor(id, body),
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  showSuccess: (message: string) => showSuccess(message),
}));

const list = toVendorList({
  totalRecord: 1,
  totalPage: 1,
  currentPage: 1,
  limit: 10,
  vendorList: [
    {
      vendorId: 'v1',
      shopName: 'Demo Shop',
      status: 'PENDING',
      commissionRate: 10,
      rating: 4.5,
      ratingCount: 8,
      pendingAmount: 1200,
      isDocumentsSubmitted: true,
      createdAt: '2026-10-21T10:00:00.000Z',
      userData: { name: 'Rahul', email: 'rahul@demo.com' },
    },
  ],
});

const firstOf = (items: HTMLElement[]) => {
  const [first] = items;
  if (!first) throw new Error('no matching element');
  return first;
};

describe('VendorList', () => {
  beforeEach(() => {
    resetSeedStore();
    resetVendorsCache();
    getVendors.mockReset();
    approveVendor.mockReset();
    rejectVendor.mockReset();
    suspendVendor.mockReset();
    showSuccess.mockReset();
  });

  afterEach(() => cleanup());

  it('renders the vendors of the list', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });

    render(<VendorList />);

    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    expect(screen.getByText('rahul@demo.com')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('shows the empty state when there is no vendor', async () => {
    getVendors.mockResolvedValue({
      status: true,
      message: 'ok',
      data: toVendorList({ totalRecord: 0 }),
    });

    render(<VendorList />);

    expect(await screen.findByText('No vendors found')).toBeInTheDocument();
  });

  it('shows the API error with a retry', async () => {
    getVendors.mockResolvedValue({
      status: false,
      message: 'Forbidden.',
      data: toVendorList(),
    });

    render(<VendorList />);

    expect(await screen.findByText('Forbidden.')).toBeInTheDocument();
  });

  it('approves a vendor with a commission rate', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    approveVendor.mockResolvedValue({ status: true, message: 'ok', data: {} });

    render(<VendorList />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Vendor actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Approve' }));
    expect(await screen.findByRole('heading', { name: 'Approve vendor' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Commission rate (%)'), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Approve vendor' }));

    await waitFor(() =>
      expect(approveVendor).toHaveBeenCalledWith('v1', {
        commissionRate: 12,
        remark: undefined,
      }),
    );
    expect(showSuccess).toHaveBeenCalledWith('Vendor approved.');
  });

  it('opens the filter sheet and applies a status filter only on done', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });

    render(<VendorList />);

    fireEvent.click(await screen.findByRole('button', { name: /filters/i }));
    expect(await screen.findByRole('heading', { name: 'Filter vendors' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Approved' }));
    expect(getVendors).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() =>
      expect(getVendors).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'APPROVED' }),
    );
  });

  it('asks for a reason before rejecting', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    rejectVendor.mockResolvedValue({ status: true, message: 'ok', data: {} });

    render(<VendorList />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Vendor actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reject' }));
    expect(await screen.findByRole('heading', { name: 'Reject vendor' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reject vendor' }));
    expect(await screen.findByText('Enter a reason.')).toBeInTheDocument();
    expect(rejectVendor).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Documents missing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reject vendor' }));

    await waitFor(() => expect(rejectVendor).toHaveBeenCalledWith('v1', { reason: 'Documents missing' }));
  });

  it('reactivates a suspended vendor and keeps its commission', async () => {
    getVendors.mockResolvedValue({
      status: true,
      message: 'ok',
      data: toVendorList({
        totalRecord: 1,
        totalPage: 1,
        currentPage: 1,
        limit: 10,
        vendorList: [
          { vendorId: 'v2', shopName: 'Sleepy Shop', status: 'SUSPENDED', commissionRate: 12 },
        ],
      }),
    });
    approveVendor.mockResolvedValue({ status: true, message: 'ok', data: {} });

    render(<VendorList />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Vendor actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reactivate' }));
    expect(await screen.findByRole('heading', { name: 'Reactivate vendor' })).toBeInTheDocument();
    expect(screen.getByText('Current commission: 12%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reactivate vendor' }));

    await waitFor(() => expect(approveVendor).toHaveBeenCalledWith('v2', { commissionRate: 12 }));
    expect(showSuccess).toHaveBeenCalledWith('Vendor reactivated.');
  });
});
