import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type { ActivityLogData, OrderSummaryData, UserDetailData } from '@/lib/api/contract';

export function useCustomerDetail(userId: string) {
  const [detail, setDetail] = useState<UserDetailData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogData[]>([]);
  const [orders, setOrders] = useState<OrderSummaryData[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const loadDetail = useCallback(async () => {
    const response = await apiService.getUserById(userId);
    if (response.status) {
      setDetail(response.data);
    } else {
      setError(response.message);
    }
  }, [userId]);

  const loadActivity = useCallback(async () => {
    const response = await apiService.getUserActivity(userId, { page: activityPage, limit: 10 });
    if (response.status) {
      setActivityLogs(response.data.itemList);
      setActivityTotal(response.data.totalRecord);
    }
  }, [userId, activityPage]);

  const loadOrders = useCallback(async () => {
    const response = await apiService.getUserOrders(userId, { page: ordersPage, limit: 10 });
    if (response.status) {
      setOrders(response.data.itemList);
      setOrdersTotal(response.data.totalRecord);
    }
  }, [userId, ordersPage]);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      await loadDetail();
      await loadActivity();
      await loadOrders();
      if (active) setIsLoading(false);
    };
    void loadAll();
    return () => {
      active = false;
    };
  }, [userId, loadDetail, loadActivity, loadOrders]);

  const suspendUser = useCallback(async (isActive: boolean, reason?: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.toggleUserStatus(userId, {
      isActive,
      ...(reason ? { reason } : {}),
    });
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await loadDetail();
    return true;
  }, [userId, loadDetail]);

  const banUser = useCallback(async (reason: string, durationDays?: number) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.banCustomer(userId, {
      reason,
      ...(durationDays ? { durationDays } : {}),
    });
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await loadDetail();
    return true;
  }, [userId, loadDetail]);

  const unbanUser = useCallback(async () => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.unbanCustomer(userId);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await loadDetail();
    return true;
  }, [userId, loadDetail]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void loadDetail();
    void loadActivity();
    void loadOrders();
  }, [loadDetail, loadActivity, loadOrders]);

  return {
    detail,
    activityLogs,
    orders,
    activityPage,
    setActivityPage,
    ordersPage,
    setOrdersPage,
    activityTotal,
    ordersTotal,
    isLoading,
    error,
    actionError,
    isActioning,
    suspendUser,
    banUser,
    unbanUser,
    refresh,
    clearActionError: () => setActionError(''),
  };
}
