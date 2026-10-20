import type {
  KycDocumentListData,
  VendorBankData,
  VendorData,
  VendorKycDocumentData,
  VendorListData,
  VendorRatingSummaryData,
  VendorSummaryData,
  VendorUserData,
} from '@/lib/api/contract';

type RawVendorUser = Partial<Record<keyof VendorUserData, unknown>>;
type RawVendorBank = Partial<Record<keyof VendorBankData, unknown>>;
type RawVendorSummary = Partial<Record<keyof VendorSummaryData, unknown>>;
type RawKycDocument = Partial<Record<keyof Omit<VendorKycDocumentData, 'vendorData'>, unknown>> & {
  vendorData?: RawVendorSummary;
};
type RawVendor = Partial<Record<keyof Omit<VendorData, 'userData' | 'bankData' | 'documentList'>, unknown>> & {
  userData?: RawVendorUser;
  bankData?: RawVendorBank;
  documentList?: unknown;
};
type RawVendorList = Partial<Record<keyof Omit<VendorListData, 'itemList'>, unknown>> & {
  vendorList?: unknown;
};
type RawKycDocumentList = Partial<Record<keyof Omit<KycDocumentListData, 'itemList'>, unknown>> & {
  documentList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toVendorUser = (raw: RawVendorUser = {}): VendorUserData => ({
  userId: toString(raw.userId),
  name: toString(raw.name),
  email: toString(raw.email),
  phone: toString(raw.phone),
  avatarUrl: toString(raw.avatarUrl),
  isActive: raw.isActive === true,
});

const toVendorBank = (raw: RawVendorBank = {}): VendorBankData => ({
  bankHolderName: toString(raw.bankHolderName),
  bankAccountNo: toString(raw.bankAccountNo),
  bankIfsc: toString(raw.bankIfsc),
  upiId: toString(raw.upiId),
  hasBankDetails: raw.hasBankDetails === true,
  hasUpi: raw.hasUpi === true,
});

const toVendorSummary = (raw: RawVendorSummary = {}): VendorSummaryData => ({
  vendorId: toString(raw.vendorId),
  shopName: toString(raw.shopName),
  slug: toString(raw.slug),
});

export const toKycDocument = (raw: RawKycDocument = {}): VendorKycDocumentData => ({
  documentId: toString(raw.documentId),
  vendorId: toString(raw.vendorId),
  docType: toString(raw.docType),
  fileUrl: toString(raw.fileUrl),
  number: toString(raw.number),
  isVerified: raw.isVerified === true,
  remark: toString(raw.remark),
  verifiedAt: toString(raw.verifiedAt),
  createdAt: toString(raw.createdAt),
  vendorData: toVendorSummary(raw.vendorData),
});

export const toKycDocumentList = (raw: RawKycDocumentList = {}): KycDocumentListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.documentList)
    ? raw.documentList.filter(isObject).map((item) => toKycDocument(item))
    : [],
});

export const toVendorRatings = (raw: Partial<VendorRatingSummaryData> = {}) => ({
  average: toNumber(raw.average),
  total: toNumber(raw.total),
  breakdownList: Array.isArray(raw.breakdownList)
    ? raw.breakdownList.filter(isObject).map((item) => ({
        star: toNumber(item.star),
        count: toNumber(item.count),
        percent: toNumber(item.percent),
      }))
    : [],
});

export const toVendor = (raw: RawVendor = {}): VendorData => ({
  vendorId: toString(raw.vendorId),
  userId: toString(raw.userId),
  shopName: toString(raw.shopName),
  slug: toString(raw.slug),
  description: toString(raw.description),
  logo: toString(raw.logo),
  banner: toString(raw.banner),
  gstNumber: toString(raw.gstNumber),
  panNumber: toString(raw.panNumber),
  status: toString(raw.status),
  isApproved: raw.isApproved === true,
  commissionRate: toNumber(raw.commissionRate),
  payoutCycleDays: toNumber(raw.payoutCycleDays),
  rating: toNumber(raw.rating),
  ratingCount: toNumber(raw.ratingCount),
  totalSales: toNumber(raw.totalSales),
  pendingAmount: toNumber(raw.pendingAmount),
  isDocumentsSubmitted: raw.isDocumentsSubmitted === true,
  documentsVerifiedAt: toString(raw.documentsVerifiedAt),
  approvedAt: toString(raw.approvedAt),
  rejectedReason: toString(raw.rejectedReason),
  isOnVacation: raw.isOnVacation === true,
  vacationMessage: toString(raw.vacationMessage),
  vacationUntil: toString(raw.vacationUntil),
  createdAt: toString(raw.createdAt),
  updatedAt: toString(raw.updatedAt),
  userData: toVendorUser(raw.userData),
  bankData: toVendorBank(raw.bankData),
  documentList: Array.isArray(raw.documentList)
    ? raw.documentList.filter(isObject).map((item) => toKycDocument(item))
    : [],
});

export const toVendorList = (raw: RawVendorList = {}): VendorListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.vendorList)
    ? raw.vendorList.filter(isObject).map((item) => toVendor(item))
    : [],
});
