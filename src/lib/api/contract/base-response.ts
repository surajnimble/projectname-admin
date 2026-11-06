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

export interface UserImpersonationData {
  accessToken: string;
  expiresIn: number;
  expiresAt: string;
  isImpersonating: boolean;
  userData: UserData;
}

export interface UserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  loyaltyTier: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
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

export type UserListData = PageData<UserData>;

export interface PermissionData {
  roleList: Record<string, string[]>;
  permissionList: string[];
}

export interface AuthData {
  accessToken: string;
  expiresIn: number;
  twoFactorRequired: boolean;
  userData: UserData;
  rolesList: string[];
  permissionList: string[];
}

export type DashboardStatKey =
  | 'totalUsers'
  | 'totalVendors'
  | 'pendingVendors'
  | 'totalProducts'
  | 'totalOrders'
  | 'revenue30d'
  | 'openTickets'
  | 'pendingReturns'
  | 'pendingRefunds'
  | 'pendingAdminOrders';

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
  pendingAdminOrders: number;
  /** Metrics actually returned by the API for the caller's permissions. */
  availableStats: DashboardStatKey[];
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
  productId: string;
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

export interface StockMovementData {
  movementId: string;
  productId: string;
  productName: string;
  sku: string;
  variantId: string;
  adjustment: number;
  previousStock: number;
  stock: number;
  reason: string;
  action: string;
  actorName: string;
  createdAt: string;
}

export type StockMovementListData = PageData<StockMovementData>;

export interface InventorySummaryData {
  products: number;
  units: number;
  low: number;
  out: number;
}

export interface InventoryProductData extends LowStockProductData {
  variantId: string;
  variantTitle: string;
  isVariant: boolean;
  hasVariants: boolean;
}

export interface InventoryListData extends PageData<InventoryProductData> {
  summary: InventorySummaryData;
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

export interface CommissionBoundsData {
  min: number;
  max: number;
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

export interface VendorBulkResultData {
  updatedCount: number;
  failedList: { vendorId: string; reason: string }[];
}

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

export interface PayoutBulkApproveData {
  approvedCount: number;
  failedList: { payoutId: string; reason: string }[];
}

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
  vendorData: { vendorId: string; shopName: string };
  approvalStatus: string;
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

export interface ProductApprovalData {
  productId: string;
  vendorId: string;
  name: string;
  slug: string;
  sku: string;
  status: string;
  approvalStatus: string;
  submittedAt: string;
  approvedBy: string;
  rejectedBy: string;
  rejectionReason: string;
  vendorData: { vendorId: string; shopName: string };
  createdAt: string;
}

export type ProductApprovalListData = PageData<ProductApprovalData>;

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
  trackingNumber: string;
  shipmentData: {
    shipmentId: string;
    awb: string;
    status: string;
    trackingUrl: string;
    estimatedDays: number;
    shippedAt: string;
    deliveredAt: string;
  };
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

export interface OrderReviewData {
  subOrderId: string;
  orderId: string;
  orderNumber: string;
  status: string;
  orderStatus: string;
  total: number;
  subtotal: number;
  placedAt: string;
  vendorId: string;
  shopName: string;
  customerData: OrderCustomerData;
  itemCount: number;
}

export type OrderReviewListData = PageData<OrderReviewData>;

export interface OrderBulkReviewResult {
  action: string;
  requestedCount: number;
  updatedCount: number;
  skippedCount: number;
  skippedList: { subOrderId: string; reason: string }[];
}

/* ---------- Catalog: Categories ---------- */
export interface CategoryData {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parentId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  childCount: number;
  productCount: number;
}

export type CategoryListData = PageData<CategoryData>;

/* ---------- Catalog: Brands ---------- */
export interface BrandData {
  brandId: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export type BrandListData = PageData<BrandData>;

/* ---------- Catalog: Tags ---------- */
export interface TagData {
  tagId: string;
  name: string;
  slug: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TagListData = PageData<TagData>;

/* ---------- Catalog: Attributes ---------- */
export interface AttributeData {
  attributeId: string;
  name: string;
  slug: string;
  type: string;
  isVariant: boolean;
  isFilterable: boolean;
  sortOrder: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AttributeListData = PageData<AttributeData>;

/* ---------- Catalog: Collections ---------- */
export interface CollectionData {
  collectionId: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CollectionListData = PageData<CollectionData>;

/* ---------- Content: Pages ---------- */
export interface PageContentData {
  pageId: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PageListData = PageData<PageContentData>;

/* ---------- Content: Blogs ---------- */
export interface BlogData {
  blogId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BlogListData = PageData<BlogData>;

/* ---------- Content: FAQs ---------- */
export interface FaqData {
  faqId: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type FaqListData = PageData<FaqData>;

/* ---------- Content: Banners ---------- */
export interface BannerData {
  bannerId: string;
  title: string;
  subtitle: string;
  image: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export type BannerListData = PageData<BannerData>;

/* ---------- Analytics ---------- */
export interface AnalyticsOverviewData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface AnalyticsVisitorData {
  date: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
}

export interface AnalyticsPageViewData {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  bounceRate: number;
}

export interface AnalyticsTrafficSourceData {
  source: string;
  medium: string;
  visits: number;
  conversions: number;
}

export interface AnalyticsDeviceData {
  device: string;
  os: string;
  browser: string;
  visitors: number;
}

export interface AnalyticsGeoData {
  country: string;
  city: string;
  visitors: number;
  conversions: number;
}

export interface AnalyticsSessionData {
  sessionId: string;
  userId: string;
  userName: string;
  device: string;
  country: string;
  pagesViewed: number;
  duration: number;
  lastActivity: string;
  isActive: boolean;
}

export type AnalyticsSessionListData = PageData<AnalyticsSessionData>;

export interface AnalyticsFunnelStepData {
  step: string;
  label: string;
  users: number;
  conversionRate: number;
  dropOff: number;
}

export interface AnalyticsConversionData {
  date: string;
  visitors: number;
  conversions: number;
  rate: number;
  revenue: number;
}

export interface AnalyticsCrashData {
  crashId: string;
  appVersion: string;
  os: string;
  device: string;
  error: string;
  count: number;
  lastOccurred: string;
}

export type AnalyticsCrashListData = PageData<AnalyticsCrashData>;

export interface AnalyticsAppVersionData {
  platform: string;
  version: string;
  users: number;
  sessions: number;
  crashes: number;
  crashRate: number;
  deviceShare: number;
}

export type AnalyticsAppVersionListData = PageData<AnalyticsAppVersionData>;

export interface AnalyticsRevenuePointData {
  bucket: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsRevenueReportData {
  from: string;
  to: string;
  groupBy: 'day' | 'week' | 'month';
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  series: AnalyticsRevenuePointData[];
}

export interface AnalyticsVendorPerformanceData {
  vendorId: string;
  shopName: string;
  slug: string;
  status: string;
  commissionRate: number;
  subOrderCount: number;
  revenue: number;
  commission: number;
  earnings: number;
  fulfilmentRate: number;
}

export type AnalyticsVendorPerformanceListData = PageData<AnalyticsVendorPerformanceData>;

export interface AnalyticsCohortPointData {
  date: string;
  carts: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}

export interface AnalyticsCustomerCohortsData {
  from: string;
  to: string;
  series: AnalyticsCohortPointData[];
}

export interface AnalyticsAbandonedCartItemData {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface AnalyticsAbandonedCartData {
  cartId: string;
  itemCount: number;
  value: number;
  abandonedForHours: number;
  userData: { userId: string; name: string; email: string };
  itemList: AnalyticsAbandonedCartItemData[];
}

export interface AnalyticsAbandonedCartListData extends PageData<AnalyticsAbandonedCartData> {
  totalValue: number;
}

export interface AnalyticsSearchTermData {
  searchLogId: string;
  term: string;
  resultCount: number;
  hasResults: boolean;
  createdAt: string;
}

export type AnalyticsSearchTermListData = PageData<AnalyticsSearchTermData>;

export interface AnalyticsFunnelStepMetricData {
  stepId: string;
  name: string;
  eventName: string;
  sortOrder: number;
  count: number;
  dropOff: number;
  conversionRate: number;
}

export interface AnalyticsFunnelReportData {
  funnelId: string;
  name: string;
  from: string;
  to: string;
  overallConversionRate: number;
  stepList: AnalyticsFunnelStepMetricData[];
}

export interface AnalyticsFunnelData {
  funnelId: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  stepCount: number;
  stepList: { stepId: string; name: string; eventName: string; sortOrder: number }[];
}

export interface AnalyticsFunnelListData {
  funnelCount: number;
  funnelList: AnalyticsFunnelData[];
}

export interface AnalyticsRealtimeData {
  windowMinutes: number;
  activeVisitors: number;
  pageViews: number;
  orders: number;
  recentEventList: { name: string; sessionKey: string; at: string }[];
}

/* ---------- Notifications ---------- */
export interface NotificationData {
  notificationId: string;
  userId: string;
  userName: string;
  type: string;
  channel: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string;
  createdAt: string;
}

export type NotificationListData = PageData<NotificationData>;

export interface NotificationTemplateData {
  templateId: string;
  key: string;
  name: string;
  channel: string;
  title: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationTemplateListData = PageData<NotificationTemplateData>;

export interface NotificationUnreadCountData {
  unreadCount: number;
}

export interface DeviceTokenData {
  deviceId: string;
  userId: string;
  fcmToken: string;
  platform: string;
  lastSeenAt: string;
}

export type DeviceTokenListData = PageData<DeviceTokenData>;

/* ---------- Reviews ---------- */
export interface ReviewData {
  reviewId: string;
  productId: string;
  productName: string;
  vendorId: string;
  vendorShopName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  vendorReply: string;
  repliedAt: string;
  repliedById: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewListData = PageData<ReviewData>;

export interface ReviewSummaryData {
  productId: string;
  averageRating: number;
  totalCount: number;
  verifiedCount: number;
  distributionList: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

/* ---------- Questions ---------- */
export interface QuestionData {
  questionId: string;
  productId: string;
  productName: string;
  vendorId: string;
  vendorShopName: string;
  userId: string;
  userName: string;
  question: string;
  isAnonymous: boolean;
  isApproved: boolean;
  answers: Array<{
    answerId: string;
    answer: string;
    userId: string;
    userName: string;
    createdAt: string;
    isApproved: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type QuestionListData = PageData<QuestionData>;

/* ---------- Tickets ---------- */
export interface TicketData {
  ticketId: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  categoryId: string;
  categoryName: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assignedToId: string;
  assignedToName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
  closedAt: string;
}

export type TicketListData = PageData<TicketData>;

export interface TicketCategoryData {
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TicketCategoryListData = PageData<TicketCategoryData>;

export interface ConversationParticipantData {
  userId: string;
  lastReadAt: string;
  isArchived: boolean;
  userData: { userId: string; name: string; avatarUrl: string };
  vendorData: { vendorId: string; shopName: string; slug: string };
}

export interface ConversationData {
  conversationId: string;
  lastMessageAt: string;
  isActive: boolean;
  createdAt: string;
  lastMessageData: { messageId: string; body: string; senderId: string; isRead: boolean; createdAt: string };
  participantList: ConversationParticipantData[];
}

export type ConversationListData = PageData<ConversationData>;

export interface ChatMessageData {
  messageId: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: string[];
  isRead: boolean;
  readAt: string;
  isDeleted: boolean;
  createdAt: string;
  senderData: { userId: string; name: string; avatarUrl: string };
}

export type ChatMessageListData = PageData<ChatMessageData>;

export interface TicketMessageData {
  messageId: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketNoteData {
  noteId: string;
  ticketId: string;
  userId: string;
  userName: string;
  note: string;
  createdAt: string;
}

/* ---------- Canned Responses ---------- */
export interface CannedResponseData {
  responseId: string;
  title: string;
  body: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CannedResponseListData = PageData<CannedResponseData>;

/* ---------- Settings ---------- */
export interface SettingData {
  settingId: string;
  key: string;
  value: string | number | boolean;
  category: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: string;
}

export type SettingListData = PageData<SettingData>;

export interface FeatureFlagsData {
  [key: string]: boolean;
}

export interface MaintenanceStatusData {
  enabled: boolean;
  message: string;
  allowedIps: string[];
}

/* ---------- Order Notes ---------- */
export interface OrderNoteData {
  noteId: string;
  orderId: string;
  userId: string;
  userName: string;
  note: string;
  createdAt: string;
}

export type OrderNoteListData = PageData<OrderNoteData>;

/* ---------- Order Tags ---------- */
export interface OrderTagData {
  tagId: string;
  orderId: string;
  name: string;
  color: string;
  createdAt: string;
}

export type OrderTagListData = PageData<OrderTagData>;

/* ---------- Delivery Boys ---------- */
export interface DeliveryBoyData {
  deliveryBoyId: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  isActive: boolean;
  currentOrderCount: number;
  maxOrders: number;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryBoyListData = PageData<DeliveryBoyData>;

/* ---------- Audit Logs ---------- */
export interface AuditLogData {
  auditLogId: string;
  actorId: string;
  actorRole: string;
  impersonatedById: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  changes: Record<string, unknown>;
  meta: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
  actorData: ActivityLogUserData;
  impersonatedByData: ActivityLogUserData;
}

export type AuditLogListData = PageData<AuditLogData>;

/* ---------- System Health ---------- */
export interface SystemHealthDatabaseData {
  ok: boolean;
  latencyMs: number;
}

export interface SystemHealthData {
  status: string;
  database: SystemHealthDatabaseData;
  uptimeSeconds: number;
  memoryMb: number;
  nodeVersion: string;
  checkedAt: string;
}

/* ---------- Cron Jobs ---------- */
export interface CronJobData {
  name: string;
  queue: string;
  job: string;
  cron: string;
  description: string;
  nextRunAt: string;
  isRegistered: boolean;
}

export type CronJobListData = PageData<CronJobData>;

/* ---------- Failed Jobs ---------- */
export interface FailedJobData {
  failedJobId: string;
  jobName: string;
  queue: string;
  attempt: number;
  maxAttempts: number;
  lastError: string;
  failedAt: string;
  status: string;
}

export type FailedJobListData = PageData<FailedJobData>;

export interface FailedJobStatsData {
  pendingCount: number;
  resolvedCount: number;
  abandonedCount: number;
}

/* ---------- Customer Detail ---------- */
export interface AddressData {
  addressId: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export interface SocialProviderData {
  provider: string;
  providerId: string;
}

export interface UserStatsData {
  orderCount: number;
  reviewCount: number;
  addressCount: number;
}

export interface UserDetailData {
  role: string;
  userData: UserData;
  banData: {
    isActive: boolean;
    reason: string;
    expiresAt: string;
    revokedAt: string;
    revokeReason: string;
  };
  vendorData: Record<string, unknown>;
  addressList: AddressData[];
  socialProviderList: SocialProviderData[];
  statsData: UserStatsData;
}

export interface WalletSummaryData {
  isEnabled: boolean;
  balance: number;
  totalCredited: number;
  totalDebited: number;
  maxBalance: number;
  minRedeem: number;
  expiryDays: number;
  canRedeem: boolean;
}

export interface WalletTransactionData {
  transactionId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  orderId: string;
  description: string;
  reference: string;
  isCredit: boolean;
  createdAt: string;
}

export type WalletTransactionListData = PageData<WalletTransactionData>;

export interface LoyaltyTierData {
  name: string;
  minPoints: number;
  multiplier: number;
}

export interface LoyaltySummaryData {
  userId: string;
  isEnabled: boolean;
  balance: number;
  tier: string;
  multiplier: number;
  pointsToNextTier: number;
  nextTier: string;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  transactionCount: number;
  pointValue: number;
  redeemableAmount: number;
  minRedeemPoints: number;
  tierList: LoyaltyTierData[];
}

export interface LoyaltyTransactionData {
  transactionId: string;
  type: string;
  points: number;
  balanceAfter: number;
  orderId: string;
  description: string;
  createdAt: string;
}

export type LoyaltyTransactionListData = PageData<LoyaltyTransactionData>;
export type LoyaltyTierListData = { loyaltyTierList: LoyaltyTierData[]; totalRecord: number };

export interface GiftCardData {
  giftCardId: string;
  code: string;
  title: string;
  description: string;
  value: number;
  status: string;
  userId: string;
  usedOrderId: string;
  expiresAt: string;
  redeemedAt: string;
  createdAt: string;
}

export type GiftCardListData = PageData<GiftCardData>;

export interface ReferralData {
  referralId: string;
  referralCode: string;
  status: string;
  referrerReward: number;
  refereeReward: number;
  completedAt: string;
  expiresAt: string;
  createdAt: string;
  userData: { userId: string; name: string; email: string };
}

export type ReferralListData = PageData<ReferralData>;

export interface NewsletterSubscriberData {
  subscriberId: string;
  email: string;
  isActive: boolean;
  isSubscribed: boolean;
  subscribedAt: string;
  unsubscribedAt: string;
}

export type NewsletterSubscriberListData = PageData<NewsletterSubscriberData>;



export interface ShipmentTrackingData {
  awb: string;
  orderNumber: string;
  status: string;
  trackingUrl: string;
  estimatedDays: number;
  shippedAt: string;
  deliveredAt: string;
  remarks: string;
}

/* ---------- Platform operations ---------- */
export interface AdminDeviceData {
  deviceId: string;
  recordId: string;
  userId: string;
  platform: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  model: string;
  manufacturer: string;
  appVersion: string;
  locale: string;
  timezone: string;
  ip: string;
  isBlocked: boolean;
  isTrusted: boolean;
  lastSeenAt: string;
  createdAt: string;
}
export type AdminDeviceListData = PageData<AdminDeviceData>;

export interface AdminApiKeyData {
  apiKeyId: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  isActive: boolean;
  usageCount: number;
  auditedCallCount: number;
  lastUsedAt: string;
  expiresAt: string;
  revokedAt: string;
  createdAt: string;
  secret: string;
  note: string;
}
export interface AdminApiKeyListData { itemCount: number; apiKeyList: AdminApiKeyData[] }

export interface AdminWebhookData {
  webhookId: string;
  url: string;
  events: string[];
  provider: string;
  isActive: boolean;
  failureCount: number;
  lastFiredAt: string;
  createdAt: string;
  secret: string;
  note: string;
}
export type AdminWebhookListData = PageData<AdminWebhookData>;
export interface AdminWebhookLogData {
  webhookLogId: string;
  endpointId: string;
  direction: string;
  provider: string;
  event: string;
  eventId: string;
  payload: unknown;
  statusCode: number;
  isProcessed: boolean;
  error: string;
  durationMs: number;
  createdAt: string;
}
export type AdminWebhookLogListData = PageData<AdminWebhookLogData>;

export interface CurrencyData {
  currencyId: string;
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}
export interface CurrencyListData { currencyList: CurrencyData[]; totalRecord: number }
export interface TaxConfigData {
  taxConfigId: string;
  name: string;
  slug: string;
  percent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  isInclusive: boolean;
  vendorId: string;
  stateCode: string;
  isActive: boolean;
  createdAt: string;
}
export interface TaxConfigListData { taxConfigList: TaxConfigData[]; totalRecord: number }
export interface CountryData {
  countryId: string;
  code: string;
  name: string;
  dialCode: string;
  currency: string;
  isActive: boolean;
  stateCount: number;
  stateList: Array<{ stateId: string; code: string; name: string; isActive: boolean }>;
}
export type CountryListData = PageData<CountryData>;

/* ---------- Coupons ---------- */
export interface CouponData {
  couponId: string;
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  applicableTo: string;
  applicableVendors: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CouponListData = PageData<CouponData>;

export interface CouponUsageData {
  usageId: string;
  couponId: string;
  userId: string;
  orderId: string;
  amount: number;
  createdAt: string;
  couponData: { couponId: string; code: string; title: string; type: string };
  userData: { userId: string; name: string; email: string };
}

export type CouponUsageListData = PageData<CouponUsageData>;

/* ---------- Flash Sales ---------- */
export interface FlashSaleProductData {
  productId: string;
  name: string;
  slug: string;
  price: number;
  mrpPrice: number;
  imageList: string[];
}

export interface FlashSaleItemData {
  flashSaleItemId: string;
  productId: string;
  salePrice: number;
  saleStock: number;
  soldCount: number;
  isSoldOut: boolean;
  productData: FlashSaleProductData;
}

export interface FlashSaleData {
  flashSaleId: string;
  name: string;
  slug: string;
  banner: string;
  startsAt: string;
  endsAt: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  isLive: boolean;
  itemList: FlashSaleItemData[];
}

export type FlashSaleListData = PageData<FlashSaleData>;

/* ---------- Shipping Zones ---------- */
export interface ShippingZoneData {
  zoneId: string;
  name: string;
  description: string;
  countries: string[];
  states: string[];
  cities: string[];
  pincodes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShippingZoneListData = PageData<ShippingZoneData>;

export interface ShippingPartnerData {
  partnerId: string;
  name: string;
  code: string;
  apiUrl: string;
  isActive: boolean;
  createdAt: string;
}

export type ShippingPartnerListData = PageData<ShippingPartnerData>;
