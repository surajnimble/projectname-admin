import { CreditCard, LayoutDashboard, ShoppingCart, Store, Users, type LucideIcon } from 'lucide-react';
import { MESSAGES } from '@/messages';

export const SITE = {
  name: 'Projectname Admin',
  shortName: 'Projectname',
  description: 'Back-office for the Projectname marketplace',
  appVersion: '0.1.0',
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  maintenance: '/maintenance',
  vendors: '/vendors',
  payments: '/payments',
  orders: '/orders',
  orderDetails: (orderId: string) => `/orders/${orderId}`,
  componentsShowcase: '/components-showcase',
  settings: '/settings',
  vendorDetails: (vendorId: string) => `/vendors/${vendorId}`,
  vendorProductDetails: (vendorId: string, productId: string) =>
    `/vendors/${vendorId}/products/${productId}`,
  subAdmins: '/sub-admins',
} as const;

export const ROLES = {
  superAdmin: 'SUPER_ADMIN',
  subAdmin: 'SUB_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STAFF_ROLES: readonly Role[] = [ROLES.superAdmin, ROLES.subAdmin];

export const PERMISSIONS = {
  dashboardView: 'dashboard:view',
  systemHealthView: 'system:health:view',
  cacheClear: 'system:cache:clear',
  cronTrigger: 'system:cron:trigger',
  maintenanceToggle: 'system:maintenance:toggle',
  settingsView: 'settings:view',
  settingsUpdate: 'settings:update',
  settingsReset: 'settings:reset',
  featureToggle: 'settings:feature:toggle',
  userList: 'user:list',
  userView: 'user:view',
  userUpdate: 'user:update',
  userDelete: 'user:delete',
  userSuspend: 'user:suspend',
  userBan: 'user:ban',
  userSegmentManage: 'user:segment:manage',
  userExport: 'user:export',
  userImpersonate: 'user:impersonate',
  vendorList: 'vendor:list',
  vendorView: 'vendor:view',
  vendorUpdate: 'vendor:update',
  vendorApprove: 'vendor:approve',
  vendorReject: 'vendor:reject',
  vendorSuspend: 'vendor:suspend',
  vendorCommissionUpdate: 'vendor:commission:update',
  vendorKycVerify: 'vendor:kyc:verify',
  vendorCouponManage: 'vendor:coupon:manage',
  vendorCustomerBlock: 'vendor:customer:block',
  categoryManage: 'category:manage',
  brandManage: 'brand:manage',
  tagManage: 'tag:manage',
  attributeManage: 'attribute:manage',
  collectionManage: 'collection:manage',
  productCreate: 'product:create',
  productUpdate: 'product:update',
  productDelete: 'product:delete',
  productViewAll: 'product:view:all',
  orderList: 'order:list',
  orderView: 'order:view',
  orderUpdateStatus: 'order:status:update',
  orderCancel: 'order:cancel',
  orderAssignDelivery: 'order:delivery:assign',
  paymentList: 'payment:list',
  paymentConfirm: 'payment:confirm',
  paymentRefund: 'payment:refund',
  payoutList: 'payout:list',
  payoutApprove: 'payout:approve',
  payoutReject: 'payout:reject',
  payoutGenerate: 'payout:generate',
  returnList: 'return:list',
  returnApprove: 'return:approve',
  returnReject: 'return:reject',
  returnRefund: 'return:refund',
  couponManage: 'coupon:manage',
  flashSaleManage: 'flashsale:manage',
  bannerManage: 'banner:manage',
  giftCardManage: 'giftcard:manage',
  referralManage: 'referral:manage',
  reviewModerate: 'review:moderate',
  questionModerate: 'question:moderate',
  pageManage: 'page:manage',
  blogManage: 'blog:manage',
  faqManage: 'faq:manage',
  contentView: 'content:view',
  ticketList: 'ticket:list',
  ticketReply: 'ticket:reply',
  ticketAssign: 'ticket:assign',
  ticketManage: 'ticket:manage',
  contactView: 'contact:view',
  newsletterManage: 'newsletter:manage',
  walletAdjust: 'wallet:adjust',
  loyaltyManage: 'loyalty:manage',
  chatView: 'chat:view',
  notificationSend: 'notification:send',
  notificationTemplateManage: 'notification:template:manage',
  analyticsView: 'analytics:view',
  analyticsExport: 'analytics:export',
  reportView: 'report:view',
  reportExport: 'report:export',
  deviceView: 'device:view',
  deviceBlock: 'device:block',
  auditLogView: 'auditlog:view',
  auditLogPurge: 'auditlog:purge',
  activityLogView: 'activitylog:view',
  trackingView: 'tracking:view',
  bulkImport: 'bulk:import',
  apiKeyManage: 'apikey:manage',
  webhookManage: 'webhook:manage',
  currencyManage: 'currency:manage',
  taxManage: 'tax:manage',
  countryManage: 'country:manage',
  shippingManage: 'shipping:manage',
  deliveryBoyManage: 'deliveryboy:manage',
  subAdminManage: 'subadmin:manage',
  rolePermissionManage: 'rolepermission:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// The backend reads device identity from headers; every auth schema rejects a device object in the body.
export const DEVICE_HEADERS = {
  id: 'x-device-id',
  platform: 'x-platform',
  appVersion: 'x-app-version',
  model: 'x-device-model',
  locale: 'x-locale',
  timezone: 'x-timezone',
} as const;

export const COOKIES = {
  sessionHint: 'admin_session',
} as const;

export const STORAGE_KEYS = {
  deviceId: 'device_id',
} as const;

export const QUERY_PARAMS = {
  next: 'next',
} as const;

export const EVENTS = {
  maintenance: 'app:maintenance',
} as const;

export const PLATFORM = 'WEB' as const;

export const CURRENCY = {
  locale: 'en-IN',
  code: 'INR',
} as const;

export const DATE_LOCALE = 'en-US';

export const RECENT_ACTIVITY_LIMIT = 6;

export const DASHBOARD_WIDGET_LIMIT = 5;

export const PRODUCT_PERFORMANCE_DAYS = 30;

export const VENDOR_PAGE_SIZE = 10;

export const ORDER_PAGE_SIZE = 10;

export const ORDER_STATUSES = {
  all: 'all',
  pending: 'PENDING',
  pendingToken: 'PENDING_TOKEN',
  confirmed: 'CONFIRMED',
  shipped: 'SHIPPED',
  outForDelivery: 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  returned: 'RETURNED',
} as const;

export const ORDER_STATUS_OPTIONS = [
  ORDER_STATUSES.pending,
  ORDER_STATUSES.pendingToken,
  ORDER_STATUSES.confirmed,
  ORDER_STATUSES.shipped,
  ORDER_STATUSES.outForDelivery,
  ORDER_STATUSES.delivered,
  ORDER_STATUSES.cancelled,
  ORDER_STATUSES.returned,
] as const;

export type OrderStatusFilter = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const SUB_ADMIN_PAGE_SIZE = 10;

export const VENDOR_SKELETON_ROWS = 5;

export const VENDOR_REASON_MAX_LENGTH = 500;

export const VENDOR_COMMISSION_MIN = 0;

export const VENDOR_COMMISSION_MAX = 100;

export const PRODUCT_STATUSES = {
  draft: 'DRAFT',
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  archived: 'ARCHIVED',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export const PRODUCT_PAGE_SIZE = 10;

export const PRODUCT_SKELETON_ROWS = 5;

export const VENDOR_STATUSES = {
  all: 'all',
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  suspended: 'SUSPENDED',
  inactive: 'INACTIVE',
} as const;

export type VendorStatusFilter = (typeof VENDOR_STATUSES)[keyof typeof VENDOR_STATUSES];

export const ORDER_PLACED_ACTION = 'ORDER_PLACED';

export const TIMING = {
  sessionCookieMaxAgeSec: 7 * 24 * 60 * 60,
  healthFreshMs: 30_000,
  healthPollMs: 60_000,
  slowRequestHintMs: 6_000,
  rippleHoldDelayMs: 200,
  ripplePressMs: 1000,
  rippleClickMs: 380,
  rippleClickTailMs: 360,
  ripplePressFadeMs: 450,
  rippleClickFadeMs: 400,
} as const;

export const RIPPLE_TARGET_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="radio"]',
  '[data-ripple]',
].join(', ');

export const RIPPLE_SIZE_REFERENCE_PX = 320;
export const RIPPLE_MAX_SIZE_SCALE = 1.6;

export const REGEX = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[0-9][0-9\s-]{6,17}$/,
} as const;

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: readonly Role[];
  permission?: Permission;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', href: ROUTES.home, icon: LayoutDashboard },
  { label: MESSAGES.sections.vendors, href: ROUTES.vendors, icon: Store, permission: PERMISSIONS.vendorList },
  { label: MESSAGES.sections.orders, href: ROUTES.orders, icon: ShoppingCart, permission: PERMISSIONS.orderList },
  { label: MESSAGES.payments.title, href: ROUTES.payments, icon: CreditCard, permission: PERMISSIONS.paymentList },
  { label: 'Components', href: ROUTES.componentsShowcase, icon: LayoutDashboard },
  { label: MESSAGES.sections.subAdmins, href: ROUTES.subAdmins, icon: Users, roles: [ROLES.superAdmin] },
];
