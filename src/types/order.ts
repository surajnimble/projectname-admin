import type {
  OrderAddressData,
  OrderCustomerData,
  OrderDetailData,
  OrderItemData,
  OrderListData,
  OrderNoteListData,
  OrderSummaryData,
  OrderTagListData,
  OrderTimelineData,
  OrderVendorData,
  OrderReviewListData,
  OrderBulkReviewResult,
} from '@/lib/api/contract';

type Raw = Record<string, unknown>;
type RawOrderList = Partial<Record<keyof Omit<OrderListData, 'itemList'>, unknown>> & {
  orderList?: unknown;
};

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

const toVendor = (raw: Raw = {}): OrderVendorData => {
  const vendorData = isObject(raw.vendorData) ? raw.vendorData : {};
  const shipment = isObject(raw.shipmentData) ? raw.shipmentData : {};
  return {
    subOrderId: toString(raw.subOrderId),
    vendorId: toString(raw.vendorId) || toString(vendorData.vendorId),
    status: toString(raw.status),
    shopName: toString(raw.shopName) || toString(vendorData.shopName),
    trackingNumber: toString(raw.trackingNumber),
    shipmentData: {
      shipmentId: toString(shipment.shipmentId), awb: toString(shipment.awb),
      status: toString(shipment.status), trackingUrl: toString(shipment.trackingUrl),
      estimatedDays: toNumber(shipment.estimatedDays), shippedAt: toString(shipment.shippedAt),
      deliveredAt: toString(shipment.deliveredAt),
    },
  };
};

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
  vendorList: toObjects(raw.vendorList ?? raw.subOrderList).map(toVendor),
});

export const toOrderList = (raw: RawOrderList = {}): OrderListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: toObjects(raw.orderList).map(toOrderSummary),
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

type RawOrderNoteList = Partial<Record<keyof Omit<OrderNoteListData, 'itemList'>, unknown>> & {
  noteList?: unknown;
};

export const toOrderNoteList = (raw: RawOrderNoteList = {}): OrderNoteListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.noteList)
    ? raw.noteList.filter(isObject).map((item) => ({
        noteId: toString(item.noteId),
        orderId: toString(item.orderId),
        userId: toString(item.userId),
        userName: toString(item.userName),
        note: toString(item.note),
        createdAt: toString(item.createdAt),
      }))
    : [],
});

type RawOrderReviewList = Partial<Record<keyof Omit<OrderReviewListData, 'itemList'>, unknown>> & {
  reviewList?: unknown;
};

export const toOrderReviewList = (raw: RawOrderReviewList = {}): OrderReviewListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: toObjects(raw.reviewList).map((item) => ({
    subOrderId: toString(item.subOrderId),
    orderId: toString(item.orderId),
    orderNumber: toString(item.orderNumber),
    status: toString(item.status),
    orderStatus: toString(item.orderStatus),
    total: toNumber(item.total),
    subtotal: toNumber(item.subtotal),
    placedAt: toString(item.placedAt),
    vendorId: toString(item.vendorId),
    shopName: toString(item.shopName),
    customerData: toCustomer(isObject(item.customerData) ? item.customerData : {}),
    itemCount: toNumber(item.itemCount),
  })),
});

type RawOrderTagList = Partial<Record<keyof Omit<OrderTagListData, 'itemList'>, unknown>> & {
  orderTagList?: unknown;
};

export const toOrderTagList = (raw: RawOrderTagList = {}): OrderTagListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.orderTagList)
    ? raw.orderTagList.filter(isObject).map((item) => ({
        tagId: toString(item.tagId),
        orderId: toString(item.orderId),
        name: toString(item.name),
        color: toString(item.color),
        createdAt: toString(item.createdAt),
      }))
    : [],
});


export const toOrderBulkReviewResult = (raw: Raw = {}): OrderBulkReviewResult => ({
  action: toString(raw.action),
  requestedCount: toNumber(raw.requestedCount),
  updatedCount: toNumber(raw.updatedCount),
  skippedCount: toNumber(raw.skippedCount),
  skippedList: toObjects(raw.skippedList).map((row) => ({
    subOrderId: toString(row.subOrderId),
    reason: toString(row.reason),
  })),
});
