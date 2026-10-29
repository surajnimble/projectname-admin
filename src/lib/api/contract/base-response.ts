// The response envelope plus every payload the backend returns (`AuthData`,
// `UserData`, `EmptyData`, …). Add a new response interface here; the matching
// `toXxx` mapper lives in `types/<domain>.ts`.

export class BaseResponse<T> {
  status: boolean;
  message: string;
  data: T;

  constructor(init: { status: boolean; message: string; data: T }) {
    this.status = init.status;
    this.message = init.message;
    this.data = init.data;
  }
}

export interface PageData<T> {
  totalRecord: number;
  totalPage: number;
  currentPage: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number;
  previousPage: number;
  itemList: T[];
}

export type ActivityLogListData = PageData<ActivityLogData>;

export interface UserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface SubAdminData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubAdminListData = PageData<SubAdminData>;

export interface PermissionData {
  roleList: Record<string, string[]>;
}

export interface AuthData {
  accessToken: string;
  expiresIn: number;
  twoFactorRequired: boolean;
  userData: UserData;
  rolesList: string[];
  permissionList: string[];
}

export interface DashboardStatsData {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  totalOrders: number;
  revenue30d: number;
  openTickets: number;
  pendingReturns: number;
  pendingRefunds: number;
}

export interface ActivityLogUserData {
  userId: string;
  name: string;
  email: string;
}

export interface ActivityLogData {
  activityLogId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, unknown>;
  ip: string;
  deviceId: string;
  createdAt: string;
  userData: ActivityLogUserData;
}

export interface PaymentOrderData {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
}

export interface PaymentSummaryData {
  paymentId: string;
  orderId: string;
  amount: number;
  paidAmount: number;
  method: string;
  status: string;
  reference: string;
  isTokenPayment: boolean;
  isBalancePayment: boolean;
  isPaid: boolean;
  paidAt: string;
  createdAt: string;
  orderData: PaymentOrderData;
}

export type PaymentListData = PageData<PaymentSummaryData>;

export interface ProductPerformanceData {
  productId: string;
  name: string;
  qty: number;
  revenue: number;
  views: number;
  rating: number;
}

export type ProductPerformanceListData = PageData<ProductPerformanceData>;

export interface LowStockProductData {
  name: string;
  sku: string;
  shop: string;
  stock: number;
  threshold: number;
  status: string;
  isLow: boolean;
}

export interface LowStockListData {
  totalRecord: number;
  itemList: LowStockProductData[];
}

export interface VendorUserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface VendorRatingBreakdownData {
  star: number;
  count: number;
  percent: number;
}

export interface VendorRatingSummaryData {
  average: number;
  total: number;
  breakdownList: VendorRatingBreakdownData[];
}

export interface VendorBankData {
  bankHolderName: string;
  bankAccountNo: string;
  bankIfsc: string;
  upiId: string;
  hasBankDetails: boolean;
  hasUpi: boolean;
}

export interface VendorSummaryData {
  vendorId: string;
  shopName: string;
  slug: string;
}

export interface VendorKycDocumentData {
  documentId: string;
  vendorId: string;
  docType: string;
  fileUrl: string;
  number: string;
  isVerified: boolean;
  remark: string;
  verifiedAt: string;
  createdAt: string;
  vendorData: VendorSummaryData;
}

export type KycDocumentListData = PageData<VendorKycDocumentData>;

export interface VendorData {
  vendorId: string;
  userId: string;
  shopName: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  gstNumber: string;
  panNumber: string;
  status: string;
  isApproved: boolean;
  commissionRate: number;
  payoutCycleDays: number;
  rating: number;
  ratingCount: number;
  totalSales: number;
  pendingAmount: number;
  isDocumentsSubmitted: boolean;
  documentsVerifiedAt: string;
  approvedAt: string;
  rejectedReason: string;
  isOnVacation: boolean;
  vacationMessage: string;
  vacationUntil: string;
  createdAt: string;
  updatedAt: string;
  userData: VendorUserData;
  bankData: VendorBankData;
  documentList: VendorKycDocumentData[];
}

export type VendorListData = PageData<VendorData>;

export interface PayoutData {
  payoutId: string;
  vendorId: string;
  amount: number;
  method: string;
  status: string;
  period: string;
  reference: string;
  notes: string;
  rejectReason: string;
  requestedBy: string;
  approvedBy: string;
  isPending: boolean;
  isApproved: boolean;
  isPaid: boolean;
  approvedAt: string;
  processedAt: string;
  createdAt: string;
  bankData: { upiId: string; bankHolderName: string; bankIfsc: string; accountNo: string };
}

export type PayoutListData = PageData<PayoutData>;

export interface PayoutStatementData {
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  earningList: {
    earningId: string;
    orderId: string;
    amount: number;
    netAmount: number;
    commission: number;
    status: string;
    createdAt: string;
  }[];
}

export interface ReturnItemData {
  returnItemId: string;
  orderItemId: string;
  qty: number;
  refundAmount: number;
  isApproved: boolean;
}

export interface ReturnRequestData {
  returnId: string;
  returnNumber: string;
  orderId: string;
  subOrderId: string;
  vendorId: string;
  userId: string;
  status: string;
  reasonText: string;
  comment: string;
  images: string[];
  refundAmount: number;
  refundMode: string;
  rejectReason: string;
  requestedAt: string;
  pickedUpAt: string;
  receivedAt: string;
  settlementDays: number;
  expectedSettlementAt: string;
  vendorData: { vendorId: string; shopName: string; slug: string };
  itemList: ReturnItemData[];
}

export type ReturnListData = PageData<ReturnRequestData>;

export interface ProductSummaryData {  productId: string;
  vendorId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrpPrice: number;
  stock: number;
  condition: string;
  warrantyMonths: number;
  isNonReturnable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  soldCount: number;
  createdAt: string;
  imageList: string[];
  categoryData: { categoryId: string; name: string };
}

export type ProductListData = PageData<ProductSummaryData>;

export interface ProductVariantData {
  variantId: string;
  title: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrpPrice: number;
  stock: number;
  isActive: boolean;
}

export interface ProductAttributeData {
  attributeId: string;
  name: string;
  value: string;
}

export interface ProductTagData {
  tagId: string;
  name: string;
  slug: string;
}

export interface ProductReviewData {
  reviewId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  vendorReply: string;
  createdAt: string;
  userData: { userId: string; name: string };
}

export interface ProductDetailData {
  productId: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  mrpPrice: number;
  taxPercent: number;
  stock: number;
  lowStockThreshold: number;
  condition: string;
  warrantyMonths: number;
  warrantySummary: string;
  isNonReturnable: boolean;
  weight: number;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isOutOfStock: boolean;
  soldCount: number;
  viewCount: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  imageList: string[];
  categoryData: { categoryId: string; name: string; slug: string };
  brandData: { brandId: string; name: string; slug: string };
  variantList: ProductVariantData[];
  attributeList: ProductAttributeData[];
  tagList: ProductTagData[];
  reviewList: ProductReviewData[];
}

export interface EmptyData {
  [key: string]: never;
}

export const emptyData = (): EmptyData => ({});

export interface OrderCustomerData {
  userId: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderVendorData {
  subOrderId: string;
  vendorId: string;
  status: string;
  shopName: string;
}

export interface OrderSummaryData {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  isCancelled: boolean;
  deliveredAt: string;
  createdAt: string;
  userData: OrderCustomerData;
  vendorList: OrderVendorData[];
}

export type OrderListData = PageData<OrderSummaryData>;

export interface OrderAddressData {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface OrderItemData {
  orderItemId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  qty: number;
  total: number;
}

export interface OrderTimelineData {
  timelineId: string;
  status: string;
  fromStatus: string;
  remark: string;
  location: string;
  createdAt: string;
}

export interface OrderDetailData extends OrderSummaryData {
  currency: string;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  taxAmount: number;
  shippingAmount: number;
  walletAmount: number;
  notes: string;
  cancelReason: string;
  updatedAt: string;
  addressData: OrderAddressData;
  itemList: OrderItemData[];
  timelineList: OrderTimelineData[];
}
