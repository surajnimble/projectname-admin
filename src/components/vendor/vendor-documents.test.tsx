import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toKycDocumentList } from '@/types/vendor';
import { VendorDocuments } from './vendor-documents';

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
  documentList: [
    {
      documentId: 'd1',
      vendorId: 'v1',
      docType: 'GST',
      number: '27ABCDE1234F1Z5',
      isVerified: false,
      vendorData: { vendorId: 'v1', shopName: 'Demo Shop', slug: 'demo-shop' },
    },
  ],
});

const firstOf = (items: HTMLElement[]) => {
  const [first] = items;
  if (!first) throw new Error('no matching element');
  return first;
};

describe('VendorDocuments', () => {
  beforeEach(() => {
    getVendorDocuments.mockReset();
    verifyVendorDocument.mockReset();
    getVendorDocuments.mockResolvedValue({ status: true, message: 'ok', data: list });
    verifyVendorDocument.mockResolvedValue({ status: true, message: 'ok', data: {} });
  });

  afterEach(() => cleanup());

  it('lists the documents of the vendors', async () => {
    render(<VendorDocuments />);

    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    expect(screen.getAllByText('GST').length).toBeGreaterThan(0);
    expect(screen.getByText('27ABCDE1234F1Z5')).toBeInTheDocument();
  });

  it('verifies a document', async () => {
    render(<VendorDocuments />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Document actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Verify' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Verify document' }));

    await waitFor(() =>
      expect(verifyVendorDocument).toHaveBeenCalledWith('d1', { isVerified: true, remark: undefined }),
    );
  });

  it('asks for a remark before rejecting a document', async () => {
    render(<VendorDocuments />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Document actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reject' }));

    const input = await screen.findByLabelText('Remark');
    fireEvent.change(input, { target: { value: 'Blurry scan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reject document' }));

    await waitFor(() =>
      expect(verifyVendorDocument).toHaveBeenCalledWith('d1', {
        isVerified: false,
        remark: 'Blurry scan',
      }),
    );
  });

  it('shows the empty state when no document exists', async () => {
    getVendorDocuments.mockResolvedValue({
      status: true,
      message: 'ok',
      data: toKycDocumentList({ totalRecord: 0 }),
    });

    render(<VendorDocuments />);

    expect(await screen.findByText('No KYC documents')).toBeInTheDocument();
  });
});
