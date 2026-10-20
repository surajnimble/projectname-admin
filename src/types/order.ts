import type {
  OrderAddressData,
  OrderCustomerData,
  OrderDetailData,
  OrderItemData,
  OrderListData,
  OrderSummaryData,
  OrderTimelineData,
  OrderVendorData,
} from '@/lib/api/contract';

type Raw = Record<string, unknown>;

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Raw => typeof value === 'object' && value !== null;

const toObjects = (value: unknown): Raw[] => (Array.isArray(value) ? value.filter(isObject) : []);

const toCustomer = (raw: Raw = {}): OrderCustomerData => ({
  userId: toString(raw.userId),
  name: toString(raw.name),
  email: toString(raw.email),
  phone: toString(raw.phone),
});

const toVendor = (raw: Raw = {}): OrderVendorData => ({
  subOrderId: toString(raw.subOrderId),
  vendorId: toString(raw.vendorId),
  status: toString(raw.status),
  shopName: toString(raw.shopName),
});

const toAddress = (raw: Raw = {}): OrderAddressData => ({
  fullName: toString(raw.fullName),
  phone: toString(raw.phone),
  line1: toString(raw.line1),
  line2: toString(raw.line2),
  landmark: toString(raw.landmark),
  city: toString(raw.city),
  state: toString(raw.state),
  country: toString(raw.country),
  pincode: toString(raw.pincode),
});

const toItem = (raw: Raw = {}): OrderItemData => ({
  orderItemId: toString(raw.orderItemId),
  name: toString(raw.name),
  sku: toString(raw.sku),
  image: toString(raw.image),
  price: toNumber(raw.price),
  qty: toNumber(raw.qty),
  total: toNumber(raw.total),
});

const toTimeline = (raw: Raw = {}): OrderTimelineData => ({
  timelineId: toString(raw.timelineId),
  status: toString(raw.status),
  fromStatus: toString(raw.fromStatus),
  remark: toString(raw.remark),
  location: toString(raw.location),
  createdAt: toString(raw.createdAt),
});

export const toOrderSummary = (raw: Raw = {}): OrderSummaryData => ({
  orderId: toString(raw.orderId),
  orderNumber: toString(raw.orderNumber),
  status: toString(raw.status),
  paymentMethod: toString(raw.paymentMethod),
  paymentStatus: toString(raw.paymentStatus),
  total: toNumber(raw.total),
  itemCount: toNumber(raw.itemCount),
  isCancelled: raw.isCancelled === true,
  deliveredAt: toString(raw.deliveredAt),
  createdAt: toString(raw.createdAt),
  userData: toCustomer(isObject(raw.userData) ? raw.userData : {}),
  vendorList: toObjects(raw.vendorList).map(toVendor),
});

export const toOrderList = (raw: Raw = {}): OrderListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: toObjects(raw.itemList).map(toOrderSummary),
});

export const toOrderDetail = (raw: Raw = {}): OrderDetailData => ({
  ...toOrderSummary(raw),
  currency: toString(raw.currency),
  subtotal: toNumber(raw.subtotal),
  discount: toNumber(raw.discount),
  couponDiscount: toNumber(raw.couponDiscount),
  taxAmount: toNumber(raw.taxAmount),
  shippingAmount: toNumber(raw.shippingAmount),
  walletAmount: toNumber(raw.walletAmount),
  notes: toString(raw.notes),
  cancelReason: toString(raw.cancelReason),
  updatedAt: toString(raw.updatedAt),
  addressData: toAddress(isObject(raw.addressData) ? raw.addressData : {}),
  itemList: toObjects(raw.itemList).map(toItem),
  timelineList: toObjects(raw.timelineList).map(toTimeline),
});
