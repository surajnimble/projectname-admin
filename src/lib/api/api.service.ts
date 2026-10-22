import { API_URLS } from './api-urls';
import { apiClient } from './client';
import type { ApiRequest } from '@/types/api';
import { toActivityLogList } from '@/types/activity';
import { toProductPerformanceList } from '@/types/analytics';
import { toAuthData, toEmptyData } from '@/types/auth';
import { toDashboardStats } from '@/types/dashboard';
import { toPaymentList } from '@/types/payment';
import { toProductDetail, toProductList, toProductSummary } from '@/types/product';
import { toLowStockList } from '@/types/report';
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
}

export const apiService = new ApiService();
