import {
  CreditCard,
  Gift,
  Smartphone,
  KeyRound,
  Webhook,
  Globe,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  Users,
  Tag,
  Zap,
  Layout,
  FileText,
  Image,
  Truck,
  Activity,
  Server,
  Clock,
  Star,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
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
  auditLogs: '/audit-logs',
  systemHealth: '/system',
  vendorDetails: (vendorId: string) => `/vendors/${vendorId}`,
  vendorProductDetails: (vendorId: string, productId: string) =>
    `/vendors/${vendorId}/products/${productId}`,
  subAdmins: '/sub-admins',
  productApprovals: '/product-approvals',
  customers: '/customers',
  customerDetails: (userId: string) => `/customers/${userId}`,
  deliveryBoys: '/delivery-boys',
  coupons: '/coupons',
  flashSales: '/flash-sales',
  giftCards: '/gift-cards',
  referrals: '/referrals',
  newsletter: '/newsletter',
  loyalty: '/loyalty',
  devices: '/devices',
  apiKeys: '/api-keys',
  webhooks: '/webhooks',
  regionalSettings: '/regional-settings',
  shipmentTracking: '/shipment-tracking',
  conversations: '/conversations',
  returns: '/returns',
  payouts: '/payouts',
  /* ---------- Catalog ---------- */
  categories: '/categories',
  brands: '/brands',
  tags: '/tags',
  attributes: '/attributes',
  collections: '/collections',
  /* ---------- Content ---------- */
  pages: '/pages',
  blogs: '/blogs',
  faqs: '/faqs',
  banners: '/banners',
  /* ---------- Phase 4: Operations ---------- */
  analytics: '/analytics',
  activityLogs: '/activity-logs',
  notifications: '/notifications',
  reviews: '/reviews',
  tickets: '/tickets',
  orderReviews: '/order-reviews',
  shipping: '/shipping',
  questions: '/questions',
  inventoryReport: '/inventory-report',
  reports: '/reports',
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
  productApprove: 'product:approve',
  orderList: 'order:list',
  orderView: 'order:view',
  orderUpdateStatus: 'order:status:update',
  orderConfirm: 'order:confirm',
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
  reviewManage: 'review:manage',
  questionModerate: 'question:moderate',
  questionManage: 'question:manage',
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

export const CUSTOMER_PAGE_SIZE = 10;

export const RETURNS_PAGE_SIZE = 10;

export const PAYOUTS_PAGE_SIZE = 10;
export const DELIVERY_BOY_PAGE_SIZE = 10;
export const AUDIT_LOG_PAGE_SIZE = 10;
export const FAILED_JOB_PAGE_SIZE = 10;
export const COUPON_PAGE_SIZE = 10;
export const SHIPPING_ZONE_PAGE_SIZE = 10;

export const CONTENT_PAGE_SIZE = 10;

export const ORDER_STATUSES = {
  all: 'all',
  pending: 'PENDING',
  pendingToken: 'PENDING_TOKEN',
  awaitingAdminReview: 'AWAITING_ADMIN_REVIEW',
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
  ORDER_STATUSES.awaitingAdminReview,
  ORDER_STATUSES.confirmed,
  ORDER_STATUSES.shipped,
  ORDER_STATUSES.outForDelivery,
  ORDER_STATUSES.delivered,
  ORDER_STATUSES.cancelled,
  ORDER_STATUSES.returned,
] as const;

export type OrderStatusFilter = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const SUB_ADMIN_PAGE_SIZE = 10;

export const SETTINGS_PAGE_SIZE = 50;

/**
 * Viewport width at which a list table switches from the stacked card layout to
 * the table layout. Matches the `lg` breakpoint used by `DataTableBreakpoint`.
 */
export const TABLE_DESKTOP_MEDIA_QUERY = '(min-width: 64rem)';

/** Status filter for the sub admin list. `all` omits the API filter. */
export const SUB_ADMIN_STATUS = {
  all: 'all',
  active: 'true',
  inactive: 'false',
} as const;

export type SubAdminStatusFilter = (typeof SUB_ADMIN_STATUS)[keyof typeof SUB_ADMIN_STATUS];

export const PERMISSION_GROUP_LABELS: Record<string, string> = {
  activitylog: 'Activity log',
  apikey: 'API key',
  auditlog: 'Audit log',
  deliveryboy: 'Delivery partner',
  flashsale: 'Flash sale',
  giftcard: 'Gift card',
  rolepermission: 'Role permissions',
  subadmin: 'Sub admin',
  webhook: 'Web hook',
};

export const VENDOR_REASON_MAX_LENGTH = 500;

export const VENDOR_COMMISSION_MIN = 0;

export const VENDOR_COMMISSION_MAX = 50;

export const PRODUCT_STATUSES = {
  draft: 'DRAFT',
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  archived: 'ARCHIVED',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export const PRODUCT_PAGE_SIZE = 10;

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
  permissions?: readonly Permission[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', href: ROUTES.home, icon: LayoutDashboard },
  {
    label: MESSAGES.sections.vendors,
    href: ROUTES.vendors,
    icon: Store,
    permission: PERMISSIONS.vendorList,
  },
  {
    label: MESSAGES.sections.orders,
    href: ROUTES.orders,
    icon: ShoppingCart,
    permission: PERMISSIONS.orderList,
  },
  {
    label: MESSAGES.sections.orderReviews,
    href: ROUTES.orderReviews,
    icon: Clock,
    permission: PERMISSIONS.orderConfirm,
  },
  {
    label: MESSAGES.sections.reviews,
    href: ROUTES.reviews,
    icon: Star,
    permission: PERMISSIONS.reviewModerate,
  },
  {
    label: MESSAGES.sections.shipping,
    href: ROUTES.shipping,
    icon: Truck,
    permission: PERMISSIONS.shippingManage,
  },
  {
    label: MESSAGES.sections.questions,
    href: ROUTES.questions,
    icon: MessageCircle,
    permission: PERMISSIONS.questionModerate,
  },
  {
    label: MESSAGES.sections.productApprovals,
    href: ROUTES.productApprovals,
    icon: Package,
    permission: PERMISSIONS.productApprove,
  },
  {
    label: MESSAGES.payments.title,
    href: ROUTES.payments,
    icon: CreditCard,
    permission: PERMISSIONS.paymentList,
  },
  { label: 'Components', href: ROUTES.componentsShowcase, icon: LayoutDashboard },
  {
    label: MESSAGES.sections.customers,
    href: ROUTES.customers,
    icon: Users,
    permission: PERMISSIONS.userList,
  },
  {
    label: MESSAGES.sections.deliveryBoys,
    href: ROUTES.deliveryBoys,
    icon: Truck,
    permission: PERMISSIONS.deliveryBoyManage,
  },
  {
    label: MESSAGES.sections.returns,
    href: ROUTES.returns,
    icon: ShoppingCart,
    permission: PERMISSIONS.returnList,
  },
  {
    label: MESSAGES.sections.payouts,
    href: ROUTES.payouts,
    icon: CreditCard,
    permission: PERMISSIONS.payoutList,
  },
  {
    label: MESSAGES.sections.categories,
    href: ROUTES.categories,
    icon: Layout,
    permission: PERMISSIONS.categoryManage,
  },
  {
    label: MESSAGES.sections.brands,
    href: ROUTES.brands,
    icon: Tag,
    permission: PERMISSIONS.brandManage,
  },
  {
    label: MESSAGES.sections.tags,
    href: ROUTES.tags,
    icon: Tag,
    permission: PERMISSIONS.tagManage,
  },
  {
    label: MESSAGES.sections.attributes,
    href: ROUTES.attributes,
    icon: Layout,
    permission: PERMISSIONS.attributeManage,
  },
  {
    label: MESSAGES.sections.collections,
    href: ROUTES.collections,
    icon: Package,
    permission: PERMISSIONS.collectionManage,
  },
  {
    label: MESSAGES.sections.pages,
    href: ROUTES.pages,
    icon: FileText,
    permission: PERMISSIONS.pageManage,
  },
  {
    label: MESSAGES.sections.blogs,
    href: ROUTES.blogs,
    icon: FileText,
    permission: PERMISSIONS.blogManage,
  },
  {
    label: MESSAGES.sections.faqs,
    href: ROUTES.faqs,
    icon: FileText,
    permission: PERMISSIONS.faqManage,
  },
  {
    label: MESSAGES.sections.banners,
    href: ROUTES.banners,
    icon: Image,
    permission: PERMISSIONS.bannerManage,
  },
  {
    label: MESSAGES.sections.subAdmins,
    href: ROUTES.subAdmins,
    icon: Users,
    roles: [ROLES.superAdmin],
  },
  {
    label: MESSAGES.sections.analytics,
    href: ROUTES.analytics,
    icon: LayoutDashboard,
    permission: PERMISSIONS.analyticsView,
  },
  {
    label: MESSAGES.sections.tickets,
    href: ROUTES.tickets,
    icon: Layout,
    permission: PERMISSIONS.ticketList,
  },
  {
    label: MESSAGES.sections.activity,
    href: ROUTES.activityLogs,
    icon: FileText,
    permission: PERMISSIONS.activityLogView,
  },
  {
    label: MESSAGES.sections.notifications,
    href: ROUTES.notifications,
    icon: Image,
    permissions: [PERMISSIONS.notificationSend, PERMISSIONS.notificationTemplateManage],
  },
  {
    label: MESSAGES.sections.auditLogs,
    href: ROUTES.auditLogs,
    icon: Activity,
    permission: PERMISSIONS.auditLogView,
  },
  {
    label: MESSAGES.sections.systemHealth,
    href: ROUTES.systemHealth,
    icon: Server,
    permission: PERMISSIONS.systemHealthView,
  },
  {
    label: MESSAGES.sections.inventory,
    href: ROUTES.inventoryReport,
    icon: Package,
    permission: PERMISSIONS.reportView,
  },
  {
    label: MESSAGES.sections.reports,
    href: ROUTES.reports,
    icon: FileText,
    permission: PERMISSIONS.analyticsView,
  },
  {
    label: MESSAGES.sections.coupons,
    href: ROUTES.coupons,
    icon: Tag,
    permission: PERMISSIONS.couponManage,
  },
  {
    label: MESSAGES.sections.flashSales,
    href: ROUTES.flashSales,
    icon: Zap,
    permission: PERMISSIONS.flashSaleManage,
  },
  {
    label: MESSAGES.sections.giftCards,
    href: ROUTES.giftCards,
    icon: Gift,
    permission: PERMISSIONS.giftCardManage,
  },
  {
    label: MESSAGES.sections.referrals,
    href: ROUTES.referrals,
    icon: Users,
    permission: PERMISSIONS.referralManage,
  },
  {
    label: MESSAGES.sections.newsletter,
    href: ROUTES.newsletter,
    icon: MessageCircle,
    permission: PERMISSIONS.newsletterManage,
  },
  {
    label: MESSAGES.sections.loyalty,
    href: ROUTES.loyalty,
    icon: Star,
    permission: PERMISSIONS.loyaltyManage,
  },
  {
    label: MESSAGES.sections.chat,
    href: ROUTES.conversations,
    icon: MessageCircle,
    permission: PERMISSIONS.chatView,
  },
  {
    label: MESSAGES.sections.devices,
    href: ROUTES.devices,
    icon: Smartphone,
    permission: PERMISSIONS.deviceView,
  },
  {
    label: MESSAGES.sections.apiKeys,
    href: ROUTES.apiKeys,
    icon: KeyRound,
    permission: PERMISSIONS.apiKeyManage,
  },
  {
    label: MESSAGES.sections.webhooks,
    href: ROUTES.webhooks,
    icon: Webhook,
    permission: PERMISSIONS.webhookManage,
  },
  {
    label: MESSAGES.sections.regionalSettings,
    href: ROUTES.regionalSettings,
    icon: Globe,
    permissions: [PERMISSIONS.currencyManage, PERMISSIONS.taxManage, PERMISSIONS.countryManage],
  },
  {
    label: MESSAGES.sections.shipmentTracking,
    href: ROUTES.shipmentTracking,
    icon: Truck,
    permission: PERMISSIONS.trackingView,
  },
];


export const NAV_GROUPS = [
  {
    id: 'marketplace',
    label: MESSAGES.sidebarGroups.marketplace,
    routes: [ROUTES.vendors, ROUTES.subAdmins, ROUTES.customers, ROUTES.deliveryBoys],
  },
  {
    id: 'commerce',
    label: MESSAGES.sidebarGroups.commerce,
    routes: [
      ROUTES.orders,
      ROUTES.orderReviews,
      ROUTES.payments,
      ROUTES.returns,
      ROUTES.payouts,
      ROUTES.shipping,
      ROUTES.shipmentTracking,
    ],
  },
  {
    id: 'catalog',
    label: MESSAGES.sidebarGroups.catalog,
    routes: [
      ROUTES.productApprovals,
      ROUTES.categories,
      ROUTES.brands,
      ROUTES.tags,
      ROUTES.attributes,
      ROUTES.collections,
      ROUTES.pages,
      ROUTES.blogs,
      ROUTES.faqs,
      ROUTES.banners,
      ROUTES.reviews,
      ROUTES.questions,
      ROUTES.coupons,
      ROUTES.flashSales,
      ROUTES.giftCards,
      ROUTES.referrals,
      ROUTES.newsletter,
      ROUTES.loyalty,
    ],
  },
  {
    id: 'support',
    label: MESSAGES.sidebarGroups.support,
    routes: [ROUTES.tickets, ROUTES.conversations, ROUTES.notifications],
  },
  {
    id: 'insights',
    label: MESSAGES.sidebarGroups.insights,
    routes: [
      ROUTES.analytics,
      ROUTES.inventoryReport,
      ROUTES.reports,
      ROUTES.activityLogs,
      ROUTES.auditLogs,
      ROUTES.systemHealth,
      ROUTES.devices,
      ROUTES.apiKeys,
      ROUTES.webhooks,
      ROUTES.regionalSettings,
    ],
  },
] as const;
