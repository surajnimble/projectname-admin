import { API_URLS } from './api-urls';
import { apiClient } from './client';
import type { ApiRequest } from '@/types/api';
import { toActivityLogList } from '@/types/activity';
import { toProductPerformanceList } from '@/types/analytics';
import { toAuthData, toEmptyData, toPermissionData, toSubAdmin, toSubAdminList } from '@/types/auth';
import { toDashboardStats } from '@/types/dashboard';
import { toOrderDetail, toOrderList } from '@/types/order';
import { toPaymentList, toPaymentSummary } from '@/types/payment';
import { toPayout, toPayoutList, toPayoutStatement } from '@/types/payout';
import { toProductDetail, toProductList, toProductSummary } from '@/types/product';
import { toLowStockList } from '@/types/report';
import { toReturn, toReturnList } from '@/types/return';
import { toKycDocument, toKycDocumentList, toVendor, toVendorList, toVendorRatings } from '@/types/vendor';

export class ApiService {
  login(body: ApiRequest) {
    return apiClient.post(API_URLS.login, { body, auth: false, mapper: toAuthData });
  }

  refreshToken() {
    return apiClient.post(API_URLS.refreshToken, { auth: false, mapper: toAuthData });
  }

  logout() {
    return apiClient.post(API_URLS.logout, { mapper: toEmptyData });
  }

  getMe() {
    return apiClient.get(API_URLS.getMe, { mapper: toAuthData });
  }

  checkHealth() {
    return apiClient.get(API_URLS.health, { auth: false, mapper: toEmptyData });
  }

  getDashboardStats() {
    return apiClient.get(API_URLS.getDashboardStats, { mapper: toDashboardStats });
  }

  getActivityLogs(query: Pick<ApiRequest, 'page' | 'limit' | 'action'>) {
    return apiClient.get(API_URLS.getActivityLogs, { query, mapper: toActivityLogList });
  }

  getOrders(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'status' | 'paymentStatus' | 'sort'>) {
    return apiClient.get(API_URLS.getAllOrders, { query, mapper: toOrderList });
  }

  getOrderDetails(orderId: string) {
    return apiClient.get(API_URLS.getOrderDetails(orderId), { mapper: toOrderDetail });
  }

  updateOrderStatus(orderId: string, body: Pick<ApiRequest, 'status' | 'remark' | 'location'>) {
    return apiClient.patch(API_URLS.updateOrderStatus(orderId), { body, mapper: toOrderDetail });
  }

  getPayments(query: Pick<ApiRequest, 'page' | 'limit'>) {
    return apiClient.get(API_URLS.getPayments, { query, mapper: toPaymentList });
  }

  getProductPerformance(query: Pick<ApiRequest, 'page' | 'limit' | 'sort' | 'days'>) {
    return apiClient.get(API_URLS.getProductPerformance, { query, mapper: toProductPerformanceList });
  }

  getLowStockProducts() {
    return apiClient.get(API_URLS.getInventoryReport, { mapper: toLowStockList });
  }

  getVendors(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'status'>) {
    return apiClient.get(API_URLS.getVendors, { query, mapper: toVendorList });
  }

  getVendorById(vendorId: string) {
    return apiClient.get(API_URLS.getVendorById(vendorId), { mapper: toVendor });
  }

  approveVendor(vendorId: string, body: Pick<ApiRequest, 'commissionRate' | 'remark'>) {
    return apiClient.patch(API_URLS.approveVendor(vendorId), { body, mapper: toVendor });
  }

  rejectVendor(vendorId: string, body: Required<Pick<ApiRequest, 'reason'>>) {
    return apiClient.patch(API_URLS.rejectVendor(vendorId), { body, mapper: toVendor });
  }

  suspendVendor(vendorId: string, body: Required<Pick<ApiRequest, 'reason'>>) {
    return apiClient.patch(API_URLS.suspendVendor(vendorId), { body, mapper: toVendor });
  }

  updateVendorCommission(
    vendorId: string,
    body: Required<Pick<ApiRequest, 'commissionRate'>>,
  ) {
    return apiClient.patch(API_URLS.updateVendorCommission(vendorId), { body, mapper: toVendor });
  }

  getVendorDocuments(
    query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'isVerified' | 'docType'>,
  ) {
    return apiClient.get(API_URLS.getVendorDocuments, { query, mapper: toKycDocumentList });
  }

  verifyVendorDocument(
    documentId: string,
    body: Pick<ApiRequest, 'isVerified' | 'remark'>,
  ) {
    return apiClient.patch(API_URLS.verifyVendorDocument(documentId), { body, mapper: toKycDocument });
  }

  getVendorProducts(
    vendorId: string,
    query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'status'>,
  ) {
    return apiClient.get(API_URLS.getVendorProducts(vendorId), { query, mapper: toProductList });
  }

  getVendorRatings(vendorId: string) {
    return apiClient.get(API_URLS.getVendorRatings(vendorId), { mapper: toVendorRatings });
  }

  getProducts(
    query: Pick<
      ApiRequest,
      | 'page'
      | 'limit'
      | 'search'
      | 'vendorId'
      | 'status'
      | 'inStock'
      | 'isFeatured'
      | 'minPrice'
      | 'maxPrice'
      | 'rating'
    >,
  ) {
    return apiClient.get(API_URLS.getProducts, { query, mapper: toProductList });
  }

  getProductById(productId: string) {
    return apiClient.get(API_URLS.getProductById(productId), { mapper: toProductDetail });
  }

  toggleProductStatus(productId: string, body: Required<Pick<ApiRequest, 'status'>>) {
    return apiClient.patch(API_URLS.toggleProductStatus(productId), { body, mapper: toProductSummary });
  }

  updateProductStock(
    productId: string,
    body: Pick<ApiRequest, 'stock' | 'lowStockThreshold' | 'variantId'>,
  ) {
    return apiClient.patch(API_URLS.updateProductStock(productId), { body, mapper: toProductSummary });
  }

  deleteProduct(productId: string) {
    return apiClient.delete(API_URLS.deleteProduct(productId), { mapper: toProductSummary });
  }

  getPayouts(query: Pick<ApiRequest, 'page' | 'limit' | 'status' | 'vendorId' | 'from' | 'to'>) {
    return apiClient.get(API_URLS.getPayouts, { query, mapper: toPayoutList });
  }

  approvePayout(payoutId: string, body: Pick<ApiRequest, 'reference' | 'notes'>) {
    return apiClient.patch(API_URLS.approvePayout(payoutId), { body, mapper: toPayout });
  }

  rejectPayout(payoutId: string, body: Required<Pick<ApiRequest, 'rejectReason'>>) {
    return apiClient.patch(API_URLS.rejectPayout(payoutId), { body, mapper: toPayout });
  }

  getPayoutStatement(vendorId: string) {
    return apiClient.get(API_URLS.getPayoutStatement(vendorId), { mapper: toPayoutStatement });
  }

  getReturns(query: Pick<ApiRequest, 'page' | 'limit' | 'status' | 'vendorId' | 'orderId' | 'from' | 'to'>) {
    return apiClient.get(API_URLS.getReturns, { query, mapper: toReturnList });
  }

  approveReturn(returnId: string) {
    return apiClient.patch(API_URLS.approveReturn(returnId), { body: {}, mapper: toReturn });
  }

  rejectReturn(returnId: string, body: Required<Pick<ApiRequest, 'reason'>>) {
    return apiClient.patch(API_URLS.rejectReturn(returnId), { body, mapper: toReturn });
  }

  confirmPayment(paymentId: string) {
    return apiClient.patch(API_URLS.confirmPayment(paymentId), { body: {}, mapper: toPaymentSummary });
  }

  refundPayment(
    paymentId: string,
    body: Pick<ApiRequest, 'orderId' | 'amount' | 'reason' | 'mode'>,
  ) {
    return apiClient.post(API_URLS.refundPayment(paymentId), {
      body,
      idempotencyKey: `refund-${paymentId}-${Date.now()}`,
      mapper: toPaymentSummary,
    });
  }

  createSubAdmin(body: Pick<ApiRequest, 'name' | 'email' | 'phone' | 'password' | 'permissions'>) {
    return apiClient.post(API_URLS.createSubAdmin, {
      body,
      mapper: toSubAdmin,
    });
  }

  getAllSubAdmins(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getAllSubAdmins, {
      query,
      mapper: toSubAdminList,
    });
  }

  updateSubAdmin(
    id: string,
    body: Pick<ApiRequest, 'name' | 'email' | 'phone'>,
  ) {
    return apiClient.patch(API_URLS.updateSubAdmin(id), {
      body,
      mapper: toSubAdmin,
    });
  }

  deleteSubAdmin(id: string) {
    return apiClient.delete(API_URLS.deleteSubAdmin(id), { mapper: toEmptyData });
  }

  toggleSubAdminStatus(id: string, isActive: boolean) {
    return apiClient.patch(API_URLS.toggleSubAdminStatus(id), {
      body: { key: 'status', enabled: isActive },
      mapper: toSubAdmin,
    });
  }

  getPermissions() {
    return apiClient.get(API_URLS.getPermissions, { mapper: toPermissionData });
  }

  updatePermissions(
    id: string,
    body: Pick<ApiRequest, 'permissions'>,
  ) {
    return apiClient.patch(API_URLS.updatePermissions(id), {
      body,
      mapper: toEmptyData,
    });
  }
}

export const apiService = new ApiService();
