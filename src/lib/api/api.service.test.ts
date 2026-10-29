import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EVENTS } from '@/constants';
import { clearSession, getAccessToken, setAccessToken } from '@/lib/api/session';
import { toActivityLogList } from '@/types/activity';
import { toProductPerformanceList } from '@/types/analytics';
import { toDashboardStats } from '@/types/dashboard';
import { toOrderList } from '@/types/order';
import { toPaymentList } from '@/types/payment';
import { toLowStockList } from '@/types/report';
import { toVendor, toVendorList } from '@/types/vendor';
import { apiService } from './api.service';

const respond = (status: number, body: unknown) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });

describe('ApiService', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    clearSession();
  });
  afterEach(() => vi.unstubAllGlobals());

  describe('auth', () => {
    it('logs in with only the given fields and without a bearer token', async () => {
      setAccessToken('secret');
      fetchMock.mockResolvedValueOnce(
        respond(200, { status: true, message: 'ok', result: { accessToken: 't' } }),
      );

      const response = await apiService.login({ email: 'a@b.com', password: 'x' });

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/auth/login');
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ email: 'a@b.com', password: 'x' }));
      expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
      expect(response.data.accessToken).toBe('t');
    });

    it('sends the device identity as headers', async () => {
      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));

      await apiService.login({ email: 'a@b.com', password: 'x' });

      const headers = (fetchMock.mock.calls[0]?.[1]?.headers ?? {}) as Record<string, string>;
      expect(headers['x-device-id']).toBeTruthy();
      expect(headers['x-platform']).toBe('WEB');
      expect(headers['x-app-version']).toBeTruthy();
    });

    it('dispatches the maintenance event on HTTP 503 only', async () => {
      const listener = vi.fn();
      window.addEventListener(EVENTS.maintenance, listener);
      fetchMock.mockResolvedValueOnce(
        respond(503, { status: false, message: 'Down. Error Code (SERVICE_UNAVAILABLE)', result: {} }),
      );
      await apiService.getMe();
      expect(listener).toHaveBeenCalledTimes(1);

      fetchMock.mockResolvedValueOnce(
        respond(400, { status: false, message: 'Bad. Error Code (VALIDATION_ERROR)', result: {} }),
      );
      await apiService.getMe();
      expect(listener).toHaveBeenCalledTimes(1);
      window.removeEventListener(EVENTS.maintenance, listener);
    });

    it('keeps the backend message of a 4xx envelope', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(401, { status: false, message: 'Bad. Error Code (INVALID_CREDENTIALS)', result: {} }),
      );

      const response = await apiService.login({ email: 'a@b.com', password: 'x' });

      expect(response).toMatchObject({
        status: false,
        message: 'Bad. Error Code (INVALID_CREDENTIALS)',
      });
    });

    it('gives a friendly message for gateway errors and network failures', async () => {
      fetchMock.mockResolvedValueOnce(respond(502, '<html>bad gateway</html>'));
      const gateway = await apiService.getMe();
      expect(gateway.status).toBe(false);
      expect(gateway.message).toMatch(/waking up/i);

      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      const offline = await apiService.getMe();
      expect(offline.status).toBe(false);
      expect(offline.message).not.toBe('');
    });

    it('refreshes once on a 401 and retries with the new token', async () => {
      setAccessToken('old');
      fetchMock
        .mockResolvedValueOnce(
          respond(401, { status: false, message: 'Expired. Error Code (TOKEN_EXPIRED)', result: {} }),
        )
        .mockResolvedValueOnce(
          respond(200, { status: true, message: '', result: { accessToken: 'new' } }),
        )
        .mockResolvedValueOnce(respond(200, { status: true, message: 'me', result: {} }));

      const response = await apiService.getMe();

      expect(response.status).toBe(true);
      expect(getAccessToken()).toBe('new');
      expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/v1/auth/refreshToken');
      const retryHeaders = (fetchMock.mock.calls[2]?.[1]?.headers ?? {}) as Record<string, string>;
      expect(retryHeaders.Authorization).toBe('Bearer new');
    });

    it('refreshes on any 401, even when no error code is in the message', async () => {
      setAccessToken('old');
      fetchMock
        .mockResolvedValueOnce(respond(401, { status: false, message: 'Nope.', result: {} }))
        .mockResolvedValueOnce(
          respond(200, { status: true, message: '', result: { accessToken: 'new' } }),
        )
        .mockResolvedValueOnce(respond(200, { status: true, message: 'me', result: {} }));

      const response = await apiService.getMe();

      expect(response.status).toBe(true);
      expect(getAccessToken()).toBe('new');
      expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/v1/auth/refreshToken');
    });

    it('does not refresh an unauthenticated login and clears the session when a refresh fails', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(401, { status: false, message: 'Bad. Error Code (INVALID_CREDENTIALS)', result: {} }),
      );
      const login = await apiService.login({ email: 'a@b.com', password: 'x' });
      expect(login.status).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      clearSession();
      setAccessToken('old');
      fetchMock
        .mockResolvedValueOnce(
          respond(401, { status: false, message: 'Expired. Error Code (TOKEN_EXPIRED)', result: {} }),
        )
        .mockResolvedValueOnce(
          respond(401, { status: false, message: 'Gone. Error Code (SESSION_EXPIRED)', result: {} }),
        );
      await apiService.getMe();
      expect(getAccessToken()).toBe('');
    });
  });

  describe('system and dashboard', () => {
    it('checks the health without a token', async () => {
      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));

      await apiService.checkHealth();

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/health');
      expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
    });

    it('fetches the dashboard stats and fills missing ones with zero', async () => {
      setAccessToken('secret');
      fetchMock.mockResolvedValueOnce(
        respond(200, { status: true, message: 'ok', result: { totalUsers: 4, totalVendors: 1 } }),
      );

      const response = await apiService.getDashboardStats();

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/admin/getDashboardStats');
      expect(init?.method).toBe('GET');
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer secret');
      expect(response.data.totalUsers).toBe(4);
      expect(response.data.totalVendors).toBe(1);
      expect(response.data.totalOrders).toBe(0);
      expect(response.data.revenue30d).toBe(0);
      expect(response.data).toEqual({
        ...toDashboardStats(),
        totalUsers: 4,
        totalVendors: 1,
      });
    });
  });

  describe('lists', () => {
    it('fetches the activity page', async () => {
      setAccessToken('secret');
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: { totalRecord: 1, currentPage: 1, limit: 6, itemList: [{ activityLogId: 'a1' }] },
        }),
      );

      const response = await apiService.getActivityLogs({ page: 1, limit: 6 });

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/admin/getActivityLogs?page=1&limit=6');
      expect(init?.method).toBe('GET');
      expect(response.data.itemList[0]?.activityLogId).toBe('a1');
    });

    it('fetches the payments page', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            totalRecord: 1,
            currentPage: 1,
            limit: 5,
            itemList: [{ paymentId: 'pay1', amount: 2480, status: 'PAID' }],
          },
        }),
      );

      const response = await apiService.getPayments({ page: 1, limit: 5 });

      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/payments/getAll?page=1&limit=5');
      expect(response.data.itemList[0]?.paymentId).toBe('pay1');
    });

    it('fetches the product performance with range and sort', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            totalRecord: 1,
            currentPage: 1,
            limit: 5,
            productList: [{ productId: 'p1', name: 'Demo', qty: 2, revenue: 100 }],
          },
        }),
      );

      const response = await apiService.getProductPerformance({
        page: 1,
        limit: 5,
        sort: 'qty',
        days: 30,
      });

      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe(
        '/api/v1/analytics/getProductPerformance?page=1&limit=5&sort=qty&days=30',
      );
      expect(response.data.itemList[0]?.productId).toBe('p1');
    });

    it('fetches the inventory report and keeps the low-stock rows', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            totalRecord: 2,
            rowList: [
              { name: 'Low', sku: 'LOW-1', stock: 1, threshold: 5, isLow: true },
              { name: 'Healthy', sku: 'OK-1', stock: 10, threshold: 5, isLow: false },
            ],
          },
        }),
      );

      const response = await apiService.getLowStockProducts();

      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/reports/inventory');
      expect(response.data.itemList).toHaveLength(1);
      expect(response.data.itemList[0]?.sku).toBe('LOW-1');
    });

    it('lists vendors with the filters', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            totalRecord: 1,
            currentPage: 1,
            limit: 10,
            vendorList: [{ vendorId: 'v1', shopName: 'Demo Shop' }],
          },
        }),
      );

      const response = await apiService.getVendors({
        page: 1,
        limit: 10,
        search: 'demo',
        status: 'PENDING',
      });

      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/vendors/getAll?page=1&limit=10&search=demo&status=PENDING');
      expect(response.data.itemList[0]?.shopName).toBe('Demo Shop');
    });

    it('fills a missing result with an empty page', async () => {
      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));

      const response = await apiService.getVendors({ page: 1, limit: 10 });

      expect(response.data).toEqual(toVendorList());
    });
  });

  describe('vendor actions', () => {
    it('reads one vendor with its documents', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            vendorId: 'v1',
            shopName: 'Demo Shop',
            documentList: [{ documentId: 'd1', docType: 'GST' }],
          },
        }),
      );

      const response = await apiService.getVendorById('v1');

      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/vendors/getById/v1');
      expect(response.data.shopName).toBe('Demo Shop');
      expect(response.data.documentList).toHaveLength(1);
    });

    it('updates the commission of a vendor', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, { status: true, message: 'ok', result: { vendorId: 'v1', commissionRate: 15 } }),
      );

      const response = await apiService.updateVendorCommission('v1', { commissionRate: 15 });

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/vendors/updateCommission/v1');
      expect(init?.method).toBe('PATCH');
      expect(init?.body).toBe(JSON.stringify({ commissionRate: 15 }));
      expect(response.data.commissionRate).toBe(15);
    });

    it('lists the KYC documents and verifies one', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            totalRecord: 1,
            currentPage: 1,
            limit: 10,
            documentList: [{ documentId: 'd1', docType: 'GST' }],
          },
        }),
      );

      const list = await apiService.getVendorDocuments({ page: 1, limit: 10 });

      const [listUrl] = fetchMock.mock.calls[0] ?? [];
      expect(listUrl).toBe('/api/v1/vendors/getDocuments?page=1&limit=10');
      expect(list.data.itemList[0]?.documentId).toBe('d1');

      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: { documentId: 'd1', isVerified: true },
        }),
      );
      const verified = await apiService.verifyVendorDocument('d1', { isVerified: true });
      const [verifyUrl, verifyInit] = fetchMock.mock.calls[1] ?? [];
      expect(verifyUrl).toBe('/api/v1/vendors/verifyDocuments/d1');
      expect(verifyInit?.method).toBe('PATCH');
      expect(verified.data.isVerified).toBe(true);
    });

    it('lists the products of a vendor', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, {
          status: true,
          message: 'ok',
          result: {
            totalRecord: 1,
            currentPage: 1,
            limit: 10,
            productList: [{ productId: 'p1', name: 'Demo Product' }],
          },
        }),
      );

      const response = await apiService.getVendorProducts('v1', { page: 1, limit: 10 });

      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/vendors/getProducts/v1?page=1&limit=10');
      expect(response.data.itemList[0]?.productId).toBe('p1');
    });

    it('approves a vendor with an optional commission', async () => {
      fetchMock.mockResolvedValueOnce(
        respond(200, { status: true, message: 'ok', result: { vendorId: 'v1', status: 'APPROVED' } }),
      );

      const response = await apiService.approveVendor('v1', { commissionRate: 10, remark: 'ok' });

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/vendors/approveVendor/v1');
      expect(init?.method).toBe('PATCH');
      expect(init?.body).toBe(JSON.stringify({ commissionRate: 10, remark: 'ok' }));
      expect(response.data).toEqual(toVendor({ vendorId: 'v1', status: 'APPROVED' }));
    });

    it('rejects and suspends with a reason', async () => {
      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));
      await apiService.rejectVendor('v2', { reason: 'Documents missing' });
      const [rejectUrl, rejectInit] = fetchMock.mock.calls[0] ?? [];
      expect(rejectUrl).toBe('/api/v1/vendors/rejectVendor/v2');
      expect(rejectInit?.body).toBe(JSON.stringify({ reason: 'Documents missing' }));

      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));
      await apiService.suspendVendor('v3', { reason: 'Policy violation' });
      const [suspendUrl, suspendInit] = fetchMock.mock.calls[1] ?? [];
      expect(suspendUrl).toBe('/api/v1/vendors/suspendVendor/v3');
      expect(suspendInit?.body).toBe(JSON.stringify({ reason: 'Policy violation' }));
    });
  });

  describe('orders', () => {
    it('lists orders with the filters it is given', async () => {
      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));

      await apiService.getOrders({ page: 2, limit: 10, status: 'SHIPPED', search: 'ORD' });

      const url = String(fetchMock.mock.calls[0]?.[0]);
      expect(url).toContain('/api/v1/orders/getAllOrders');
      expect(url).toContain('page=2');
      expect(url).toContain('status=SHIPPED');
      expect(url).toContain('search=ORD');
    });

    it('updates the status with only the given fields', async () => {
      fetchMock.mockResolvedValueOnce(respond(200, { status: true, message: 'ok', result: {} }));

      await apiService.updateOrderStatus('o1', { status: 'SHIPPED', remark: 'Handed over' });

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe('/api/v1/orders/updateStatus/o1');
      expect(init?.method).toBe('PATCH');
      expect(init?.body).toBe(JSON.stringify({ status: 'SHIPPED', remark: 'Handed over' }));
    });
  });

  describe('defaults', () => {
    it('never leaves a list payload undefined', async () => {
      fetchMock.mockResolvedValue(respond(200, { status: true, message: 'ok', result: {} }));

      expect((await apiService.getActivityLogs({ page: 1, limit: 6 })).data).toEqual(
        toActivityLogList(),
      );
      expect((await apiService.getPayments({ page: 1, limit: 5 })).data).toEqual(toPaymentList());
      expect((await apiService.getOrders({ page: 1, limit: 5 })).data).toEqual(toOrderList());
      expect((await apiService.getProductPerformance({ page: 1, limit: 5 })).data).toEqual(
        toProductPerformanceList(),
      );
      expect((await apiService.getLowStockProducts()).data).toEqual(toLowStockList());
    });
  });
});
