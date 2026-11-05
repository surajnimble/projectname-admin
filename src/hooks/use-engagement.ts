'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type {
  ApiRequest,
  GiftCardListData,
  LoyaltyHistoryData,
  LoyaltyPointsData,
  LoyaltyTiersData,
  ReferralCodeData,
  ReferralLeaderboardListData,
  ReferralListData,
} from '@/lib/api/contract';

export function useLoyalty() {
  const [points, setPoints] = useState<LoyaltyPointsData>({
    userId: '',
    isEnabled: false,
    balance: 0,
    tier: '',
    multiplier: 1,
    pointsToNextTier: 0,
    nextTier: '',
    totalEarned: 0,
    totalRedeemed: 0,
    totalExpired: 0,
    transactionCount: 0,
    pointValue: 0,
    redeemableAmount: 0,
    minRedeemPoints: 0,
    tierList: [],
  });
  const [tiers, setTiers] = useState<LoyaltyTiersData>({ loyaltyTierList: [], totalRecord: 0 });
  const [history, setHistory] = useState<LoyaltyHistoryData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(1);

  const loadPoints = useCallback(async () => {
    const res = await apiService.getLoyaltyPoints({});
    if (res.status) {
      setPoints(res.data as LoyaltyPointsData);
    } else {
      setError(res.message);
    }
  }, []);

  const loadTiers = useCallback(async () => {
    const res = await apiService.getLoyaltyTiers({});
    if (res.status) {
      setTiers(res.data as LoyaltyTiersData);
    } else {
      setError(res.message);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await apiService.getLoyaltyHistory({ page, limit: 20 });
    if (res.status) {
      setHistory(res.data as LoyaltyHistoryData);
    } else {
      setError(res.message);
    }
  }, [page]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setIsLoading(true);
      await loadPoints();
      await loadTiers();
      await loadHistory();
      if (active) setIsLoading(false);
    })();
    return () => { active = false; };
  }, [loadPoints, loadTiers, loadHistory]);

  const redeemPoints = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.redeemLoyaltyPoints(body);
      setIsActioning(false);
      if (res.status) {
        await loadPoints();
        await loadHistory();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [loadPoints, loadHistory],
  );

  const adjustPoints = useCallback(
    async (userId: string, body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.adjustLoyaltyPoints(userId, body);
      setIsActioning(false);
      if (res.status) {
        await loadPoints();
        await loadHistory();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [loadPoints, loadHistory],
  );

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void loadPoints();
    void loadTiers();
    void loadHistory();
  }, [loadPoints, loadTiers, loadHistory]);

  return {
    points,
    tiers,
    history,
    isLoading,
    error,
    isActioning,
    actionError,
    page,
    setPage: changePage,
    redeemPoints,
    adjustPoints,
    refresh,
  };
}

export function useReferral() {
  const [code, setCode] = useState<ReferralCodeData>({
    userId: '',
    isEnabled: false,
    referralCode: '',
    referralCount: 0,
    completedCount: 0,
    totalEarned: 0,
    referrerReward: 0,
    refereeReward: 0,
    expiryDays: 0,
  });
  const [rewards, setRewards] = useState<ReferralListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardListData>({
    referralTierList: [],
    totalRecord: 0,
  });
  const [adminReferrals, setAdminReferrals] = useState<ReferralListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(1);

  const loadCode = useCallback(async () => {
    const res = await apiService.getReferralMyCode();
    if (res.status) {
      setCode(res.data as ReferralCodeData);
    } else {
      setError(res.message);
    }
  }, []);

  const loadRewards = useCallback(async () => {
    const res = await apiService.getReferralRewards({ page, limit: 20 });
    if (res.status) {
      setRewards(res.data as ReferralListData);
    } else {
      setError(res.message);
    }
  }, [page]);

  const loadLeaderboard = useCallback(async () => {
    const res = await apiService.getReferralLeaderboard({});
    if (res.status) {
      setLeaderboard(res.data as ReferralLeaderboardListData);
    } else {
      setError(res.message);
    }
  }, []);

  const loadAdminReferrals = useCallback(async () => {
    const res = await apiService.getAllReferrals({ page, limit: 20 });
    if (res.status) {
      setAdminReferrals(res.data as ReferralListData);
    } else {
      setError(res.message);
    }
  }, [page]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setIsLoading(true);
      await loadCode();
      await loadRewards();
      await loadLeaderboard();
      await loadAdminReferrals();
      if (active) setIsLoading(false);
    })();
    return () => { active = false; };
  }, [loadCode, loadRewards, loadLeaderboard, loadAdminReferrals]);

  const applyCode = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.applyReferralCode(body);
      setIsActioning(false);
      if (res.status) {
        await loadCode();
        await loadRewards();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [loadCode, loadRewards],
  );

  const completeReferral = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.completeReferral(id);
      setIsActioning(false);
      if (res.status) {
        await loadAdminReferrals();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [loadAdminReferrals],
  );

  const updateReferralStatus = useCallback(
    async (id: string, body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.updateReferralStatus(id, body);
      setIsActioning(false);
      if (res.status) {
        await loadAdminReferrals();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [loadAdminReferrals],
  );

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void loadCode();
    void loadRewards();
    void loadLeaderboard();
    void loadAdminReferrals();
  }, [loadCode, loadRewards, loadLeaderboard, loadAdminReferrals]);

  return {
    code,
    rewards,
    leaderboard,
    adminReferrals,
    isLoading,
    error,
    isActioning,
    actionError,
    page,
    setPage: changePage,
    applyCode,
    completeReferral,
    updateReferralStatus,
    refresh,
  };
}

export function useGiftCards() {
  const [data, setData] = useState<GiftCardListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await apiService.getAllGiftCards({ page, limit: 20 });
    setIsLoading(false);
    if (res.status) {
      setData(res.data as GiftCardListData);
    } else {
      setError(res.message);
    }
  }, [page]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setIsLoading(true);
      void load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const createGiftCard = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.createGiftCard(body);
      setIsActioning(false);
      if (res.status) {
        await load();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [load],
  );

  const disableGiftCard = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.disableGiftCard(id);
      setIsActioning(false);
      if (res.status) {
        await load();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [load],
  );

  const deleteGiftCard = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const res = await apiService.deleteGiftCard(id);
      setIsActioning(false);
      if (res.status) {
        await load();
        return true;
      }
      setActionError(res.message);
      return false;
    },
    [load],
  );

  const changePage = useCallback((next: number) => setPage(next), []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    isActioning,
    actionError,
    page,
    setPage: changePage,
    createGiftCard,
    disableGiftCard,
    deleteGiftCard,
    refresh,
  };
}
