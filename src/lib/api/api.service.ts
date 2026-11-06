import { API_URLS } from './api-urls';
import { apiClient } from './client';
import type { ApiRequest } from '@/types/api';
import { toActivityLogList } from '@/types/activity';
import { toProductPerformanceList } from '@/types/analytics';
import {
  toAnalyticsOverview,
  toAnalyticsFunnelList,
  toAnalyticsFunnelReport,
  toAnalyticsRealtime,
  toAbandonedCartList,
  toCustomerCohorts,
  toRevenueReport,
  toSearchTermList,
  toVendorPerformanceList,
  toAppVersionList,
  toConversionList,
  toCrashList,
  toDeviceList,
  toGeoList,
  toPageItemList,
  toSessionList,
  toTrafficList,
  toVisitorList,
} from '@/types/analytics';
import { toAuthData, toEmptyData, toPermissionData, toSubAdmin, toSubAdminList } from '@/types/auth';
import { toCategoryList, toAttributeList, toBrandList, toTagList, toCollectionList } from '@/types/catalog';
import { toBannerList, toBlogList, toFaqList, toPageList } from '@/types/content';
import { toCouponList } from '@/types/coupon';
import { toCouponUsageList } from '@/types/coupon-usage';
import { toFlashSaleList } from '@/types/flash-sale';
import { toDeliveryBoyList } from '@/types/delivery-boy';
import { toOrderBulkReviewResult, toOrderDetail, toOrderList, toOrderNoteList, toOrderReviewList, toOrderTagList } from '@/types/order';
import { toPaymentList, toPaymentSummary } from '@/types/payment';
import { toPayout, toPayoutList, toPayoutStatement, toPayoutBulkApprove } from '@/types/payout';
import { toProductDetail, toProductList, toProductSummary, toProductApproval, toProductApprovalList } from '@/types/product';
import { toInventoryList, toLowStockList, toStockMovementList } from '@/types/report';
import { toReviewList, toQuestionList, toReviewSummary } from '@/types/review';
import { toReturn, toReturnList } from '@/types/return';
import { toSettingList, toFeatureFlags, toMaintenanceStatus } from '@/types/settings';
import { toShippingZoneList, toShippingPartnerList, toShippingPartner } from '@/types/shipping';
import { toSystemHealth } from '@/types/system-health';
import { toAuditLogList } from '@/types/audit';
import { toConversationList, toChatMessageList } from '@/types/chat';
import { toCronJobList } from '@/types/cron';
import { toFailedJobList } from '@/types/failed-job';
import { toUserList, toUserDetail, toUserImpersonation } from '@/types/user';
import { toVendor, toVendorList, toVendorRatings, toKycDocument, toKycDocumentList, toCommissionBounds, toVendorBulkResult } from '@/types/vendor';
import { toNotificationList, toNotificationTemplateList, toNotificationUnreadCount } from '@/types/notification';
import { toTicketList, toTicketCategoryList } from '@/types/ticket';
import { toDashboardStats } from '@/types/dashboard';
import { toWalletSummary, toWalletTransaction, toWalletTransactionList } from '@/types/wallet';
import { toGiftCard, toGiftCardList } from '@/types/gift-card';
import { toReferral, toReferralList } from '@/types/referral';
import { toNewsletterSubscriberList } from '@/types/newsletter';
import { toLoyaltySummary, toLoyaltyTierList, toLoyaltyTransactionList } from '@/types/loyalty';
import { toShipmentTracking } from '@/types/shipment-tracking';
import {
  toAdminDevice, toAdminDeviceList, toAdminApiKey, toAdminApiKeyList, toAdminWebhook, toAdminWebhookList,
  toAdminWebhookLogList, toCurrency, toCurrencyList, toTaxConfig, toTaxConfigList, toCountryList,
} from '@/types/platform-operations';

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

  getPendingAdminReview(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'from' | 'to'>) {
    return apiClient.get(API_URLS.getPendingAdminReview, {
      query,
      mapper: toOrderReviewList,
    });
  }

  confirmForVendor(subOrderId: string, body: Pick<ApiRequest, 'reason'>) {
    return apiClient.patch(API_URLS.confirmForVendor(subOrderId), {
      body,
      mapper: toOrderDetail,
    });
  }

  rejectByAdmin(subOrderId: string, body: Required<Pick<ApiRequest, 'reason'>>) {
    return apiClient.patch(API_URLS.rejectByAdmin(subOrderId), {
      body,
      mapper: toOrderDetail,
    });
  }

  adminBulkReview(
    body: Required<Pick<ApiRequest, 'subOrderIds' | 'action'>> & Pick<ApiRequest, 'reason'>,
  ) {
    return apiClient.post(API_URLS.adminBulkReview, { body, mapper: toOrderBulkReviewResult });
  }

  getPayments(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getPayments, { query, mapper: toPaymentList });
  }

  getProductPerformance(query: Pick<ApiRequest, 'page' | 'limit' | 'sort' | 'days'>) {
    return apiClient.get(API_URLS.getProductPerformance, { query, mapper: toProductPerformanceList });
  }

  getLowStockProducts() {
    return apiClient.get(API_URLS.getInventoryReport, { mapper: toLowStockList });
  }

  getProductInventory(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ALL' | 'LOW' | 'OUT' | 'HEALTHY';
  }) {
    return apiClient.get(API_URLS.getProductInventory, { query, mapper: toInventoryList });
  }

  exportReport(type: string, query: ApiRequest = {}) {
    return apiClient.download(API_URLS.exportReport(type), { query });
  }

  getVendors(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'status'>) {
    return apiClient.get(API_URLS.getVendors, { query, mapper: toVendorList });
  }

  getVendorById(vendorId: string) {
    return apiClient.get(API_URLS.getVendorById(vendorId), { mapper: toVendor });
  }

  getVendorCommissionBounds() {
    return apiClient.get(API_URLS.getVendorCommissionBounds, { mapper: toCommissionBounds });
  }

  approveVendor(vendorId: string, body: Pick<ApiRequest, 'commissionRate' | 'remark'>) {
    return apiClient.patch(API_URLS.approveVendor(vendorId), { body, mapper: toVendor });
  }

  bulkApproveVendors(body: { vendorIds: string[]; commissionRate?: number; remark?: string }) {
    return apiClient.post(API_URLS.bulkApproveVendors, { body, mapper: toVendorBulkResult });
  }

  bulkSuspendVendors(body: { vendorIds: string[]; reason: string }) {
    return apiClient.post(API_URLS.bulkSuspendVendors, { body, mapper: toVendorBulkResult });
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

  adjustProductStock(
    productId: string,
    body: { adjustment: number; reason: string; lowStockThreshold?: number; setStockTo?: number; expectedStock?: number; variantId?: string },
  ) {
    return apiClient.post(API_URLS.adjustProductStock(productId), { body, mapper: toProductSummary });
  }

  getStockMovements(query: { page?: number; limit?: number; productId?: string }) {
    return apiClient.get(API_URLS.getStockMovements, { query, mapper: toStockMovementList });
  }

  deleteProduct(productId: string) {
    return apiClient.delete(API_URLS.deleteProduct(productId), { mapper: toProductSummary });
  }

  submitProductForApproval(productId: string) {
    return apiClient.post(API_URLS.submitProductForApproval(productId), {
      mapper: toProductApproval,
    });
  }

  getPendingProductApprovals(
    query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'vendorId'>,
  ) {
    return apiClient.get(API_URLS.getPendingProductApprovals, {
      query,
      mapper: toProductApprovalList,
    });
  }

  approveProduct(productId: string) {
    return apiClient.patch(API_URLS.approveProduct(productId), {
      mapper: toProductApproval,
    });
  }

  rejectProduct(
    productId: string,
    body: Required<Pick<ApiRequest, 'reason'>>,
  ) {
    return apiClient.patch(API_URLS.rejectProduct(productId), {
      body,
      mapper: toProductApproval,
    });
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

  bulkApprovePayouts(body: { payoutIds: string[]; notes?: string }) {
    return apiClient.post(API_URLS.bulkApprovePayouts, { body, mapper: toPayoutBulkApprove });
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

  getAllSubAdmins(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'isActive'>) {
    return apiClient.get(API_URLS.getAllSubAdmins, {
      query,
      mapper: toSubAdminList,
    });
  }

  updateSubAdmin(
    id: string,
    body: Pick<ApiRequest, 'name' | 'email' | 'phone' | 'password'>,
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

  getUsers(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'role' | 'status'>) {
    return apiClient.get(API_URLS.getUsers, { query, mapper: toUserList });
  }

  toggleUserStatus(userId: string, body: { isActive: boolean; reason?: string }) {
    return apiClient.patch(API_URLS.toggleUserStatus(userId), {
      body,
      mapper: toUserList,
    });
  }

  banCustomer(userId: string, body: Pick<ApiRequest, 'reason' | 'durationDays'>) {
    return apiClient.post(API_URLS.banCustomer(userId), {
      body,
      mapper: toEmptyData,
    });
  }

  unbanCustomer(userId: string) {
    return apiClient.post(API_URLS.unbanCustomer(userId), {
      body: {},
      mapper: toEmptyData,
    });
  }

  getUserById(userId: string) {
    return apiClient.get(API_URLS.getUserById(userId), { mapper: toUserDetail });
  }

  impersonateUser(userId: string, body: { reason: string; durationMin: number }) {
    return apiClient.post(API_URLS.impersonateUser(userId), {
      body,
      mapper: toUserImpersonation,
    });
  }

  getUserActivity(userId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getUserActivity(userId), { query, mapper: toActivityLogList });
  }

  getUserOrders(userId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getUserOrders(userId), { query, mapper: toOrderList });
  }

  getCustomerWalletSummary(userId: string) {
    return apiClient.get(API_URLS.getCustomerWalletSummary(userId), { mapper: toWalletSummary });
  }

  getCustomerWalletTransactions(userId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getCustomerWalletTransactions(userId), {
      query,
      mapper: toWalletTransactionList,
    });
  }

  creditCustomerWallet(body: ApiRequest) {
    return apiClient.post(API_URLS.creditCustomerWallet, { body, mapper: toWalletTransaction });
  }

  debitCustomerWallet(body: ApiRequest) {
    return apiClient.post(API_URLS.debitCustomerWallet, { body, mapper: toWalletTransaction });
  }

  getGiftCards(query: ApiRequest) {
    return apiClient.get(API_URLS.getGiftCards, { query, mapper: toGiftCardList });
  }

  createGiftCard(body: ApiRequest) {
    return apiClient.post(API_URLS.createGiftCard, { body, mapper: toGiftCard });
  }

  disableGiftCard(id: string) {
    return apiClient.patch(API_URLS.disableGiftCard(id), { body: {}, mapper: toGiftCard });
  }

  deleteGiftCard(id: string) {
    return apiClient.delete(API_URLS.deleteGiftCard(id), { mapper: toEmptyData });
  }

  getAdminReferrals(query: ApiRequest) {
    return apiClient.get(API_URLS.getAdminReferrals, { query, mapper: toReferralList });
  }

  completeReferral(id: string) {
    return apiClient.post(API_URLS.completeReferral(id), { body: {}, mapper: toReferral });
  }

  updateReferralStatus(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateReferralStatus(id), { body, mapper: toReferral });
  }

  getNewsletterSubscribers(query: ApiRequest) {
    return apiClient.get(API_URLS.getNewsletterSubscribers, { query, mapper: toNewsletterSubscriberList });
  }

  sendNewsletterCampaign(body: ApiRequest) {
    return apiClient.post(API_URLS.sendNewsletterCampaign, { body, mapper: toEmptyData });
  }

  /* ---------- Admin chat review (read-only) ---------- */
  getAdminChatConversations(query: ApiRequest) {
    return apiClient.get(API_URLS.getAdminChatConversations, { query, mapper: toConversationList });
  }
  getAdminChatMessages(conversationId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getAdminChatMessages(conversationId), { query, mapper: toChatMessageList });
  }

  /* ---------- Platform operations ---------- */
  getAdminDevices(query: ApiRequest) {
    return apiClient.get(API_URLS.getAdminDevices, { query, mapper: toAdminDeviceList });
  }
  blockAdminDevice(id: string) {
    return apiClient.patch(API_URLS.blockAdminDevice(id), { body: {}, mapper: toAdminDevice });
  }
  unblockAdminDevice(id: string) {
    return apiClient.patch(API_URLS.unblockAdminDevice(id), { body: {}, mapper: toAdminDevice });
  }
  deleteAdminDevice(id: string) {
    return apiClient.delete(API_URLS.deleteAdminDevice(id), { mapper: toEmptyData });
  }
  getAdminApiKeys() {
    return apiClient.get(API_URLS.getAdminApiKeys, { mapper: toAdminApiKeyList });
  }
  createAdminApiKey(body: ApiRequest) {
    return apiClient.post(API_URLS.createAdminApiKey, { body, mapper: toAdminApiKey });
  }
  revokeAdminApiKey(id: string) {
    return apiClient.patch(API_URLS.revokeAdminApiKey(id), { body: {}, mapper: toAdminApiKey });
  }
  deleteAdminApiKey(id: string) {
    return apiClient.delete(API_URLS.deleteAdminApiKey(id), { mapper: toEmptyData });
  }
  getAdminApiKeyUsage(id: string) {
    return apiClient.get(API_URLS.getAdminApiKeyUsage(id), { mapper: toAdminApiKey });
  }
  getAdminWebhooks(query: ApiRequest) {
    return apiClient.get(API_URLS.getAdminWebhooks, { query, mapper: toAdminWebhookList });
  }
  createAdminWebhook(body: ApiRequest) {
    return apiClient.post(API_URLS.createAdminWebhook, { body, mapper: toAdminWebhook });
  }
  updateAdminWebhook(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateAdminWebhook(id), { body, mapper: toAdminWebhook });
  }
  rotateAdminWebhookSecret(id: string) {
    return apiClient.post(API_URLS.rotateAdminWebhookSecret(id), { body: {}, mapper: toAdminWebhook });
  }
  deleteAdminWebhook(id: string) {
    return apiClient.delete(API_URLS.deleteAdminWebhook(id), { mapper: toEmptyData });
  }
  getAdminWebhookLogs(query: ApiRequest) {
    return apiClient.get(API_URLS.getAdminWebhookLogs, { query, mapper: toAdminWebhookLogList });
  }
  getCurrencies(query: ApiRequest = {}) {
    return apiClient.get(API_URLS.getCurrencies, { query, mapper: toCurrencyList });
  }
  createCurrency(body: ApiRequest) {
    return apiClient.post(API_URLS.createCurrency, { body, mapper: toCurrency });
  }
  updateCurrency(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateCurrency(id), { body, mapper: toCurrency });
  }
  deleteCurrency(id: string) {
    return apiClient.delete(API_URLS.deleteCurrency(id), { mapper: toEmptyData });
  }
  getTaxConfigs(query: ApiRequest = {}) {
    return apiClient.get(API_URLS.getTaxConfigs, { query, mapper: toTaxConfigList });
  }
  createTaxConfig(body: ApiRequest) {
    return apiClient.post(API_URLS.createTaxConfig, { body, mapper: toTaxConfig });
  }
  updateTaxConfig(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateTaxConfig(id), { body, mapper: toTaxConfig });
  }
  deleteTaxConfig(id: string) {
    return apiClient.delete(API_URLS.deleteTaxConfig(id), { mapper: toEmptyData });
  }
  getCountries(query: ApiRequest) {
    return apiClient.get(API_URLS.getCountries, { query, mapper: toCountryList });
  }
  seedCountries() {
    return apiClient.post(API_URLS.seedCountries, { body: {}, mapper: toEmptyData });
  }

  getLoyaltyTiers() {
    return apiClient.get(API_URLS.getLoyaltyTiers, { mapper: toLoyaltyTierList });
  }

  getCustomerLoyaltySummary(userId: string) {
    return apiClient.get(API_URLS.getCustomerLoyaltySummary(userId), { mapper: toLoyaltySummary });
  }

  getCustomerLoyaltyHistory(userId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getCustomerLoyaltyHistory(userId), { query, mapper: toLoyaltyTransactionList });
  }

  adjustCustomerLoyaltyPoints(userId: string, body: ApiRequest) {
    return apiClient.post(API_URLS.adjustCustomerLoyaltyPoints(userId), { body, mapper: toEmptyData });
  }

  /* ---------- Catalog: Categories ---------- */
  getCategories(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'parentId' | 'isActive'>) {
    return apiClient.get(API_URLS.getCategories, { query, mapper: toCategoryList });
  }

  createCategory(body: ApiRequest) {
    return apiClient.post(API_URLS.createCategory, { body, mapper: toEmptyData });
  }

  updateCategory(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateCategory(id), { body, mapper: toEmptyData });
  }

  deleteCategory(id: string) {
    return apiClient.delete(API_URLS.deleteCategory(id), { mapper: toEmptyData });
  }

  /* ---------- Catalog: Brands ---------- */
  getBrands(query: Pick<ApiRequest, 'page' | 'limit' | 'search' | 'isActive'>) {
    return apiClient.get(API_URLS.getBrands, { query, mapper: toBrandList });
  }

  createBrand(body: ApiRequest) {
    return apiClient.post(API_URLS.createBrand, { body, mapper: toEmptyData });
  }

  updateBrand(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateBrand(id), { body, mapper: toEmptyData });
  }

  deleteBrand(id: string) {
    return apiClient.delete(API_URLS.deleteBrand(id), { mapper: toEmptyData });
  }

  /* ---------- Catalog: Tags ---------- */
  getTags(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getTags, { query, mapper: toTagList });
  }

  createTag(body: ApiRequest) {
    return apiClient.post(API_URLS.createTag, { body, mapper: toEmptyData });
  }

  deleteTag(id: string) {
    return apiClient.delete(API_URLS.deleteTag(id), { mapper: toEmptyData });
  }

  updateTag(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateTag(id), { body, mapper: toEmptyData });
  }

  /* ---------- Catalog: Attributes ---------- */
  getAttributes(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getAttributes, { query, mapper: toAttributeList });
  }

  createAttribute(body: ApiRequest) {
    return apiClient.post(API_URLS.createAttribute, { body, mapper: toEmptyData });
  }

  updateAttribute(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateAttribute(id), { body, mapper: toEmptyData });
  }

  deleteAttribute(id: string) {
    return apiClient.delete(API_URLS.deleteAttribute(id), { mapper: toEmptyData });
  }

  /* ---------- Catalog: Collections ---------- */
  getCollections(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getCollections, { query, mapper: toCollectionList });
  }

  createCollection(body: ApiRequest) {
    return apiClient.post(API_URLS.createCollection, { body, mapper: toEmptyData });
  }

  updateCollection(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateCollection(id), { body, mapper: toEmptyData });
  }

  deleteCollection(id: string) {
    return apiClient.delete(API_URLS.deleteCollection(id), { mapper: toEmptyData });
  }

  /* ---------- Content: Pages ---------- */
  getPages(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getPages, { query, mapper: toPageList });
  }

  createPage(body: ApiRequest) {
    return apiClient.post(API_URLS.createPage, { body, mapper: toEmptyData });
  }

  updatePage(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updatePage(id), { body, mapper: toEmptyData });
  }

  deletePage(id: string) {
    return apiClient.delete(API_URLS.deletePage(id), { mapper: toEmptyData });
  }

  /* ---------- Content: Blogs ---------- */
  getBlogs(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getBlogs, { query, mapper: toBlogList });
  }

  createBlog(body: ApiRequest) {
    return apiClient.post(API_URLS.createBlog, { body, mapper: toEmptyData });
  }

  updateBlog(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateBlog(id), { body, mapper: toEmptyData });
  }

  deleteBlog(id: string) {
    return apiClient.delete(API_URLS.deleteBlog(id), { mapper: toEmptyData });
  }

  /* ---------- Content: FAQs ---------- */
  getFaqs(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getFaqs, { query, mapper: toFaqList });
  }

  createFaq(body: ApiRequest) {
    return apiClient.post(API_URLS.createFaq, { body, mapper: toEmptyData });
  }

  updateFaq(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateFaq(id), { body, mapper: toEmptyData });
  }

  deleteFaq(id: string) {
    return apiClient.delete(API_URLS.deleteFaq(id), { mapper: toEmptyData });
  }

  /* ---------- Content: Banners ---------- */
  getBanners(query: Pick<ApiRequest, 'page' | 'limit' | 'search'>) {
    return apiClient.get(API_URLS.getBanners, { query, mapper: toBannerList });
  }

  createBanner(body: ApiRequest) {
    return apiClient.post(API_URLS.createBanner, { body, mapper: toEmptyData });
  }

  updateBanner(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateBanner(id), { body, mapper: toEmptyData });
  }

  deleteBanner(id: string) {
    return apiClient.delete(API_URLS.deleteBanner(id), { mapper: toEmptyData });
  }

  /* ---------- Analytics ---------- */
  getAnalyticsOverview(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsOverview, { query, mapper: toAnalyticsOverview });
  }

  getAnalyticsVisitors(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsVisitors, { query, mapper: toVisitorList });
  }

  getAnalyticsUniqueVisitors(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsUniqueVisitors, { query, mapper: toVisitorList });
  }

  getAnalyticsPageViews(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsPageViews, { query, mapper: toPageItemList });
  }

  getAnalyticsTopPages(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsTopPages, { query, mapper: toPageItemList });
  }

  getAnalyticsTrafficSources(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsTrafficSources, { query, mapper: toTrafficList });
  }

  getAnalyticsDeviceBreakdown(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsDeviceBreakdown, { query, mapper: toDeviceList });
  }

  getAnalyticsGeoBreakdown(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsGeoBreakdown, { query, mapper: toGeoList });
  }

  getAnalyticsSessions(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsSessions, { query, mapper: toSessionList });
  }

  getAnalyticsFunnel(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsFunnel, { query, mapper: toAnalyticsFunnelReport });
  }

  getAnalyticsConversions(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsConversions, { query, mapper: toConversionList });
  }

  getAnalyticsRevenueReport(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsRevenueReport, { query, mapper: toRevenueReport });
  }

  getAnalyticsProductPerformance(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsProductPerformance, {
      query,
      mapper: toProductPerformanceList,
    });
  }

  getAnalyticsVendorPerformance(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsVendorPerformance, { query, mapper: toVendorPerformanceList });
  }

  getAnalyticsCustomerCohorts(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsCustomerCohorts, { query, mapper: toCustomerCohorts });
  }

  getAnalyticsAbandonedCarts(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsAbandonedCarts, { query, mapper: toAbandonedCartList });
  }

  getAnalyticsSearchTerms(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsSearchTerms, { query, mapper: toSearchTermList });
  }

  getAnalyticsZeroResultSearches(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsZeroResultSearches, { query, mapper: toSearchTermList });
  }

  getAnalyticsRealtime() {
    return apiClient.get(API_URLS.getAnalyticsRealtime, { mapper: toAnalyticsRealtime });
  }

  getAnalyticsCrashes(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsCrashes, { query, mapper: toCrashList });
  }

  getAnalyticsAppVersions(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsAppVersions, { query, mapper: toAppVersionList });
  }

  exportAnalytics(query: ApiRequest) {
    return apiClient.download(API_URLS.exportAnalytics, { query });
  }

  getAnalyticsFunnels(query: ApiRequest) {
    return apiClient.get(API_URLS.getAnalyticsFunnels, { query, mapper: toAnalyticsFunnelList });
  }

  createAnalyticsFunnel(body: ApiRequest) {
    return apiClient.post(API_URLS.createAnalyticsFunnel, { body, mapper: toEmptyData });
  }

  updateAnalyticsFunnel(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateAnalyticsFunnel(id), { body, mapper: toEmptyData });
  }

  /* ---------- Notifications ---------- */
  getNotifications(query: ApiRequest) {
    return apiClient.get(API_URLS.getNotifications, { query, mapper: toNotificationList });
  }

  getNotificationsUnreadCount() {
    return apiClient.get(API_URLS.getNotificationsUnreadCount, { mapper: toNotificationUnreadCount });
  }

  markNotificationRead(id: string) {
    return apiClient.patch(API_URLS.markNotificationRead(id), { body: {}, mapper: toEmptyData });
  }

  markAllNotificationsRead() {
    return apiClient.patch(API_URLS.markAllNotificationsRead, { body: {}, mapper: toEmptyData });
  }

  deleteNotification(id: string) {
    return apiClient.delete(API_URLS.deleteNotification(id), { mapper: toEmptyData });
  }

  getNotificationPreferences() {
    return apiClient.get(API_URLS.getNotificationPreferences, { mapper: toEmptyData });
  }

  updateNotificationPreferences(body: ApiRequest) {
    return apiClient.patch(API_URLS.updateNotificationPreferences, { body, mapper: toEmptyData });
  }

  registerDeviceToken(body: Pick<ApiRequest, 'deviceId' | 'fcmToken' | 'platform'>) {
    return apiClient.post(API_URLS.registerDeviceToken, { body, mapper: toEmptyData });
  }

  unregisterDeviceToken(deviceId: string) {
    return apiClient.post(API_URLS.unregisterDeviceToken, { body: { deviceId }, mapper: toEmptyData });
  }

  broadcastNotification(body: ApiRequest) {
    return apiClient.post(API_URLS.broadcastNotification, { body, mapper: toEmptyData });
  }

  getNotificationTemplates() {
    return apiClient.get(API_URLS.getNotificationTemplates, { mapper: toNotificationTemplateList });
  }

  createNotificationTemplate(body: ApiRequest) {
    return apiClient.post(API_URLS.createNotificationTemplate, { body, mapper: toEmptyData });
  }

  updateNotificationTemplate(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateNotificationTemplate(id), { body, mapper: toEmptyData });
  }

  deleteNotificationTemplate(id: string) {
    return apiClient.delete(API_URLS.deleteNotificationTemplate(id), { mapper: toEmptyData });
  }

  /* ---------- Chat ---------- */
  getConversations(query: ApiRequest) {
    return apiClient.get(API_URLS.getConversations, { query, mapper: toEmptyData });
  }

  getChatUnreadCount() {
    return apiClient.get(API_URLS.getChatUnreadCount, { mapper: toEmptyData });
  }

  startConversation(body: ApiRequest) {
    return apiClient.post(API_URLS.startConversation, { body, mapper: toEmptyData });
  }

  getMessages(conversationId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getMessages(conversationId), { query, mapper: toEmptyData });
  }

  sendMessage(conversationId: string, body: ApiRequest) {
    return apiClient.post(API_URLS.sendMessage, { body: { conversationId, ...body }, mapper: toEmptyData });
  }

  markConversationRead(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.markConversationRead(id), { body, mapper: toEmptyData });
  }

  deleteMessage(id: string) {
    return apiClient.delete(API_URLS.deleteMessage(id), { mapper: toEmptyData });
  }

  blockUser(id: string, body: ApiRequest) {
    return apiClient.post(API_URLS.blockUser(id), { body, mapper: toEmptyData });
  }

  unblockUser(id: string) {
    return apiClient.post(API_URLS.unblockUser(id), { body: {}, mapper: toEmptyData });
  }

  getBlockedUsers() {
    return apiClient.get(API_URLS.getBlockedUsers, { mapper: toEmptyData });
  }

  /* ---------- Tickets ---------- */
  getTicketCategories() {
    return apiClient.get(API_URLS.getTicketCategories, { mapper: toTicketCategoryList });
  }

  createTicketCategory(body: ApiRequest) {
    return apiClient.post(API_URLS.createTicketCategory, { body, mapper: toEmptyData });
  }

  getTicketStats() {
    return apiClient.get(API_URLS.getTicketStats, { mapper: toEmptyData });
  }

  createTicket(body: ApiRequest) {
    return apiClient.post(API_URLS.createTicket, { body, mapper: toEmptyData });
  }

  getTickets(query: ApiRequest) {
    return apiClient.get(API_URLS.getTickets, { query, mapper: toTicketList });
  }

  getTicketById(id: string) {
    return apiClient.get(API_URLS.getTicketById(id), { mapper: toEmptyData });
  }

  replyTicket(id: string, body: ApiRequest) {
    return apiClient.post(API_URLS.replyTicket(id), { body, mapper: toEmptyData });
  }

  updateTicketStatus(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateTicketStatus(id), { body, mapper: toEmptyData });
  }

  assignTicket(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.assignTicket(id), { body, mapper: toEmptyData });
  }

  closeTicket(id: string) {
    return apiClient.patch(API_URLS.closeTicket(id), { body: {}, mapper: toEmptyData });
  }

  deleteTicket(id: string) {
    return apiClient.delete(API_URLS.deleteTicket(id), { mapper: toEmptyData });
  }

  addTicketNote(ticketId: string, body: ApiRequest) {
    return apiClient.post(API_URLS.addTicketNote(ticketId), { body, mapper: toEmptyData });
  }

  getTicketNotes(ticketId: string) {
    return apiClient.get(API_URLS.getTicketNotes(ticketId), { mapper: toEmptyData });
  }

  deleteTicketNote(ticketId: string, noteId: string) {
    return apiClient.delete(API_URLS.deleteTicketNote(ticketId, noteId), { mapper: toEmptyData });
  }

  /* ---------- Canned Responses ---------- */
  getCannedResponses(query: ApiRequest) {
    return apiClient.get(API_URLS.getCannedResponses, { query, mapper: toEmptyData });
  }

  createCannedResponse(body: ApiRequest) {
    return apiClient.post(API_URLS.createCannedResponse, { body, mapper: toEmptyData });
  }

  updateCannedResponse(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateCannedResponse(id), { body, mapper: toEmptyData });
  }

  deleteCannedResponse(id: string) {
    return apiClient.delete(API_URLS.deleteCannedResponse(id), { mapper: toEmptyData });
  }

  /* ---------- Reviews ---------- */
  getReviews(query: ApiRequest) {
    return apiClient.get(API_URLS.getReviews, { query, mapper: toReviewList });
  }

  getReviewSummary(productId: string) {
    return apiClient.get(API_URLS.getReviewSummary(productId), { mapper: toReviewSummary });
  }

  createReview(body: ApiRequest) {
    return apiClient.post(API_URLS.createReview, { body, mapper: toEmptyData });
  }

  updateReview(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateReview(id), { body, mapper: toEmptyData });
  }

  deleteReview(id: string) {
    return apiClient.delete(API_URLS.deleteReview(id), { mapper: toEmptyData });
  }

  approveReview(id: string, body?: ApiRequest) {
    return apiClient.patch(API_URLS.approveReview(id), { body: body || {}, mapper: toEmptyData });
  }

  rejectReview(id: string, body?: ApiRequest) {
    return apiClient.patch(API_URLS.rejectReview(id), { body: body || {}, mapper: toEmptyData });
  }

  markReviewHelpful(id: string) {
    return apiClient.post(API_URLS.markReviewHelpful(id), { body: {}, mapper: toEmptyData });
  }

  replyReview(id: string, body: ApiRequest) {
    return apiClient.post(API_URLS.replyReview(id), { body, mapper: toEmptyData });
  }

  /* ---------- Questions ---------- */
  getQuestions(query: ApiRequest) {
    return apiClient.get(API_URLS.getQuestions, { query, mapper: toQuestionList });
  }

  askQuestion(body: ApiRequest) {
    return apiClient.post(API_URLS.askQuestion, { body, mapper: toEmptyData });
  }

  answerQuestion(id: string, body: ApiRequest) {
    return apiClient.post(API_URLS.answerQuestion(id), { body, mapper: toEmptyData });
  }

  approveQuestion(id: string) {
    return apiClient.patch(API_URLS.approveQuestion(id), { body: {}, mapper: toEmptyData });
  }

  deleteQuestion(id: string) {
    return apiClient.delete(API_URLS.deleteQuestion(id), { mapper: toEmptyData });
  }

  /* ---------- Coupons ---------- */
  getCoupons(query: ApiRequest) {
    return apiClient.get(API_URLS.getCoupons, { query, mapper: toCouponList });
  }

  createCoupon(body: ApiRequest) {
    return apiClient.post(API_URLS.createCoupon, { body, mapper: toCouponList });
  }

  updateCoupon(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateCoupon(id), { body, mapper: toCouponList });
  }

  deleteCoupon(id: string) {
    return apiClient.delete(API_URLS.deleteCoupon(id), { mapper: toCouponList });
  }

  getCouponById(id: string) {
    return apiClient.get(API_URLS.getCouponById(id), { mapper: toCouponList });
  }

  applyCoupon(body: ApiRequest) {
    return apiClient.post(API_URLS.applyCoupon, { body, mapper: toCouponList });
  }

  getVendorCoupons(query: ApiRequest) {
    return apiClient.get(API_URLS.getVendorCoupons, { query, mapper: toCouponList });
  }

  createVendorCoupon(body: ApiRequest) {
    return apiClient.post(API_URLS.createVendorCoupon, { body, mapper: toCouponList });
  }

  updateVendorCoupon(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateVendorCoupon(id), { body, mapper: toCouponList });
  }

  deleteVendorCoupon(id: string) {
    return apiClient.delete(API_URLS.deleteVendorCoupon(id), { mapper: toCouponList });
  }

  validateCoupon(body: ApiRequest) {
    return apiClient.post(API_URLS.validateCoupon, { body, mapper: toCouponList });
  }

  getCouponUsages(couponId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getCouponUsages(couponId), { query, mapper: toCouponUsageList });
  }

  toggleCoupon(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.toggleCoupon(id), { body, mapper: toCouponList });
  }

  /* ---------- Flash Sales ---------- */
  getFlashSales(query: ApiRequest) {
    return apiClient.get(API_URLS.getFlashSales, { query, mapper: toFlashSaleList });
  }

  getLiveFlashSales() {
    return apiClient.get(API_URLS.getLiveFlashSales, { mapper: toEmptyData });
  }

  getFlashSaleBySlug(slug: string) {
    return apiClient.get(API_URLS.getFlashSaleBySlug(slug), { mapper: toEmptyData });
  }

  createFlashSale(body: ApiRequest) {
    return apiClient.post(API_URLS.createFlashSale, { body, mapper: toEmptyData });
  }

  updateFlashSale(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateFlashSale(id), { body, mapper: toEmptyData });
  }

  deleteFlashSale(id: string) {
    return apiClient.delete(API_URLS.deleteFlashSale(id), { mapper: toEmptyData });
  }

  /* ---------- Order Notes ---------- */
  getOrderNotes(orderId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getOrderNotes(orderId), { query, mapper: toOrderNoteList });
  }

  addOrderNote(orderId: string, body: ApiRequest) {
    return apiClient.post(API_URLS.addOrderNote(orderId), { body, mapper: toOrderNoteList });
  }

  removeOrderNote(orderId: string, noteId: string) {
    return apiClient.delete(API_URLS.removeOrderNote(orderId, noteId), { mapper: toOrderNoteList });
  }

  /* ---------- Order Tags ---------- */
  getOrderTags(orderId: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getOrderTags(orderId), { query, mapper: toOrderTagList });
  }

  addOrderTags(orderId: string, body: ApiRequest) {
    return apiClient.post(API_URLS.addOrderTags(orderId), { body, mapper: toOrderTagList });
  }

  removeOrderTag(orderId: string, tagId: string) {
    return apiClient.delete(API_URLS.removeOrderTag(orderId, tagId), { mapper: toOrderTagList });
  }

  /* ---------- Delivery Boys ---------- */
  getDeliveryBoys(query: ApiRequest) {
    return apiClient.get(API_URLS.getDeliveryBoys, { query, mapper: toDeliveryBoyList });
  }

  createDeliveryBoy(body: ApiRequest) {
    return apiClient.post(API_URLS.createDeliveryBoy, { body, mapper: toDeliveryBoyList });
  }

  updateDeliveryBoy(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateDeliveryBoy(id), { body, mapper: toDeliveryBoyList });
  }

  deleteDeliveryBoy(id: string) {
    return apiClient.delete(API_URLS.deleteDeliveryBoy(id), { mapper: toDeliveryBoyList });
  }

  toggleDeliveryBoyStatus(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.toggleDeliveryBoyStatus(id), { body, mapper: toDeliveryBoyList });
  }

  assignDeliveryBoy(subOrderId: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.assignDeliveryBoy(subOrderId), { body, mapper: toEmptyData });
  }

  verifyDeliveryOtp(subOrderId: string, body: ApiRequest) {
    return apiClient.post(API_URLS.verifyDeliveryOtp(subOrderId), { body, mapper: toEmptyData });
  }

  /* ---------- Audit Logs & System Health ---------- */
  getAuditLogs(query: ApiRequest) {
    return apiClient.get(API_URLS.getAuditLogs, { query, mapper: toAuditLogList });
  }

  getSystemHealth() {
    return apiClient.get(API_URLS.getSystemHealth, { mapper: toSystemHealth });
  }

  clearCache() {
    return apiClient.post(API_URLS.clearCache, { mapper: toEmptyData });
  }

  getCronJobs() {
    return apiClient.get(API_URLS.getCronJobs, { mapper: toCronJobList });
  }

  triggerJob(body: ApiRequest) {
    return apiClient.post(API_URLS.triggerJob, { body, mapper: toEmptyData });
  }

  getFailedJobs(query: ApiRequest) {
    return apiClient.get(API_URLS.getFailedJobs, { query, mapper: toFailedJobList });
  }

  retryFailedJob(id: string) {
    return apiClient.post(API_URLS.retryFailedJob(id), { mapper: toFailedJobList });
  }

  resolveFailedJob(id: string) {
    return apiClient.post(API_URLS.resolveFailedJob(id), { mapper: toFailedJobList });
  }

  deleteFailedJob(id: string) {
    return apiClient.delete(API_URLS.deleteFailedJob(id), { mapper: toFailedJobList });
  }

  getAdminShipmentTracking(awb: string) {
    return apiClient.get(API_URLS.getAdminShipmentTracking(awb), { mapper: toShipmentTracking });
  }

  /* ---------- Shipping Zones ---------- */
  getShippingZones(query: ApiRequest) {
    return apiClient.get(API_URLS.getShippingZones, { query, mapper: toShippingZoneList });
  }

  createShippingZone(body: ApiRequest) {
    return apiClient.post(API_URLS.createShippingZone, { body, mapper: toShippingZoneList });
  }

  updateShippingZone(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateShippingZone(id), { body, mapper: toShippingZoneList });
  }

  deleteShippingZone(id: string) {
    return apiClient.delete(API_URLS.deleteShippingZone(id), { mapper: toShippingZoneList });
  }

  toggleShippingZone(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.toggleShippingZone(id), { body, mapper: toShippingZoneList });
  }

  /* ---------- Shipping Methods ---------- */
  getShippingMethods(query: ApiRequest) {
    return apiClient.get(API_URLS.getShippingMethods, { query, mapper: toShippingZoneList });
  }

  createShippingMethod(body: ApiRequest) {
    return apiClient.post(API_URLS.createShippingMethod, { body, mapper: toShippingZoneList });
  }

  updateShippingMethod(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateShippingMethod(id), { body, mapper: toShippingZoneList });
  }

  deleteShippingMethod(id: string) {
    return apiClient.delete(API_URLS.deleteShippingMethod(id), { mapper: toShippingZoneList });
  }

  /* ---------- Shipping Partners ---------- */
  getShippingPartners(query: ApiRequest) {
    return apiClient.get(API_URLS.getShippingPartners, { query, mapper: toShippingPartnerList });
  }

  createShippingPartner(body: ApiRequest) {
    return apiClient.post(API_URLS.createShippingPartner, { body, mapper: toShippingPartner });
  }

  updateShippingPartner(id: string, body: ApiRequest) {
    return apiClient.patch(API_URLS.updateShippingPartner(id), { body, mapper: toShippingPartner });
  }

  deleteShippingPartner(id: string) {
    return apiClient.delete(API_URLS.deleteShippingPartner(id), { mapper: toEmptyData });
  }

  /* ---------- Settings ---------- */
  getSettings(query: ApiRequest) {
    return apiClient.get(API_URLS.getSettings, { query, mapper: toSettingList });
  }

  updateSetting(body: ApiRequest) {
    return apiClient.patch(API_URLS.updateSetting, { body, mapper: toEmptyData });
  }

  bulkUpdateSettings(body: ApiRequest) {
    return apiClient.post(API_URLS.bulkUpdateSettings, { body, mapper: toEmptyData });
  }

  getSettingsByCategory(category: string, query: ApiRequest) {
    return apiClient.get(API_URLS.getSettingsByCategory(category), { query, mapper: toSettingList });
  }

  resetSettings() {
    return apiClient.post(API_URLS.resetSettings, { mapper: toEmptyData });
  }

  getFeatureFlags() {
    return apiClient.get(API_URLS.getFeatureFlags, { mapper: toFeatureFlags });
  }

  toggleFeature(body: ApiRequest) {
    return apiClient.patch(API_URLS.toggleFeature, { body, mapper: toEmptyData });
  }

  getMaintenanceStatus() {
    return apiClient.get(API_URLS.getMaintenanceStatus, { mapper: toMaintenanceStatus });
  }

  updateMaintenance(body: ApiRequest) {
    return apiClient.patch(API_URLS.updateMaintenance, { body, mapper: toEmptyData });
  }
}

export const apiService = new ApiService();
