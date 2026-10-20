import { describe, expect, it } from 'vitest';
import { toKycDocument, toKycDocumentList, toVendor, toVendorList } from './vendor';

describe('toVendor', () => {
  it('maps a vendor with its owner, bank details and documents', () => {
    const vendor = toVendor({
      vendorId: 'v1',
      shopName: 'Demo Shop',
      slug: 'demo-shop',
      status: 'PENDING',
      isApproved: false,
      commissionRate: 12,
      rating: 4.5,
      ratingCount: 8,
      pendingAmount: 1200,
      isDocumentsSubmitted: true,
      createdAt: '2026-10-21T10:00:00.000Z',
      userData: { userId: 'u1', name: 'Rahul', email: 'rahul@demo.com', isActive: true },
      bankData: { bankHolderName: 'Rahul', bankAccountNo: '4111111111111111', hasBankDetails: true },
      documentList: [{ documentId: 'd1', docType: 'GST', isVerified: true }],
    });

    expect(vendor.vendorId).toBe('v1');
    expect(vendor.shopName).toBe('Demo Shop');
    expect(vendor.status).toBe('PENDING');
    expect(vendor.isApproved).toBe(false);
    expect(vendor.commissionRate).toBe(12);
    expect(vendor.rating).toBe(4.5);
    expect(vendor.pendingAmount).toBe(1200);
    expect(vendor.isDocumentsSubmitted).toBe(true);
    expect(vendor.userData.email).toBe('rahul@demo.com');
    expect(vendor.bankData.bankAccountNo).toBe('4111111111111111');
    expect(vendor.bankData.hasBankDetails).toBe(true);
    expect(vendor.documentList).toHaveLength(1);
    expect(vendor.documentList[0]?.isVerified).toBe(true);
  });

  it('fills missing fields with safe defaults', () => {
    expect(toVendor()).toMatchObject({
      vendorId: '',
      shopName: '',
      status: '',
      isApproved: false,
      commissionRate: 0,
      rating: 0,
      isDocumentsSubmitted: false,
      userData: { userId: '', name: '', email: '' },
      bankData: { bankAccountNo: '', hasBankDetails: false },
      documentList: [],
    });
  });
});

describe('toKycDocument', () => {
  it('maps a document with its vendor', () => {
    const document = toKycDocument({
      documentId: 'd1',
      vendorId: 'v1',
      docType: 'GST',
      number: '27ABCDE1234F1Z5',
      isVerified: true,
      vendorData: { vendorId: 'v1', shopName: 'Demo Shop', slug: 'demo-shop' },
    });

    expect(document.documentId).toBe('d1');
    expect(document.docType).toBe('GST');
    expect(document.isVerified).toBe(true);
    expect(document.vendorData.shopName).toBe('Demo Shop');
  });
});

describe('toKycDocumentList', () => {
  it('maps the pagination and the document list', () => {
    const list = toKycDocumentList({
      totalRecord: 1,
      currentPage: 1,
      limit: 10,
      documentList: [{ documentId: 'd1' }, null],
    });

    expect(list.totalRecord).toBe(1);
    expect(list.itemList).toHaveLength(1);
    expect(list.itemList[0]?.documentId).toBe('d1');
  });

  it('returns an empty list when documentList is missing', () => {
    expect(toKycDocumentList({ totalRecord: 3 }).itemList).toEqual([]);
  });
});

describe('toVendorList', () => {
  it('maps the pagination and the vendor list', () => {
    const list = toVendorList({
      totalRecord: 2,
      totalPage: 1,
      currentPage: 1,
      limit: 10,
      vendorList: [{ vendorId: 'v1' }, { vendorId: 'v2' }, null],
    });

    expect(list.totalRecord).toBe(2);
    expect(list.totalPage).toBe(1);
    expect(list.currentPage).toBe(1);
    expect(list.limit).toBe(10);
    expect(list.itemList.map((item) => item.vendorId)).toEqual(['v1', 'v2']);
  });

  it('returns an empty list when vendorList is missing', () => {
    expect(toVendorList({ totalRecord: 3 }).itemList).toEqual([]);
  });
});
