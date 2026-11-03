import { useCallback, useEffect, useState } from 'react';
import { FAILED_JOB_PAGE_SIZE } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { CronJobData, FailedJobData, FailedJobStatsData, SystemHealthData } from '@/lib/api/contract';

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJobData[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJobData[]>([]);
  const [failedJobStats, setFailedJobStats] = useState<FailedJobStatsData>({
    pendingCount: 0,
    resolvedCount: 0,
    abandonedCount: 0,
  });
  const [failedJobPage, setFailedJobPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const loadHealth = useCallback(async () => {
    const response = await apiService.getSystemHealth();
    if (response.status) {
      setHealth(response.data);
    } else {
      setError(response.message);
    }
  }, []);

  const loadCronJobs = useCallback(async () => {
    const response = await apiService.getCronJobs();
    if (response.status) {
      setCronJobs(response.data.itemList);
    } else {
      setError(response.message);
    }
  }, []);

  const loadFailedJobs = useCallback(async () => {
    const response = await apiService.getFailedJobs({
      page: failedJobPage,
      limit: FAILED_JOB_PAGE_SIZE,
    });
    if (response.status) {
      setFailedJobs(response.data.itemList);
      setFailedJobStats({
        pendingCount: response.data.totalRecord,
        resolvedCount: 0,
        abandonedCount: 0,
      });
    } else {
      setError(response.message);
    }
  }, [failedJobPage]);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      await loadHealth();
      await loadCronJobs();
      await loadFailedJobs();
      if (active) setIsLoading(false);
    };
    void loadAll();
    return () => {
      active = false;
    };
  }, [loadHealth, loadCronJobs, loadFailedJobs]);

  const clearCache = useCallback(async () => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.clearCache();
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    return true;
  }, []);

  const triggerJob = useCallback(async (jobName: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.triggerJob({ jobName });
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    return true;
  }, []);

  const retryFailedJob = useCallback(async (id: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.retryFailedJob(id);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await loadFailedJobs();
    return true;
  }, [loadFailedJobs]);

  const resolveFailedJob = useCallback(async (id: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.resolveFailedJob(id);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await loadFailedJobs();
    return true;
  }, [loadFailedJobs]);

  const deleteFailedJob = useCallback(async (id: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.deleteFailedJob(id);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await loadFailedJobs();
    return true;
  }, [loadFailedJobs]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void loadHealth();
    void loadCronJobs();
    void loadFailedJobs();
  }, [loadHealth, loadCronJobs, loadFailedJobs]);

  return {
    health,
    cronJobs,
    failedJobs,
    failedJobStats,
    failedJobPage,
    setFailedJobPage,
    isLoading,
    error,
    actionError,
    isActioning,
    clearCache,
    triggerJob,
    retryFailedJob,
    resolveFailedJob,
    deleteFailedJob,
    refresh,
    clearActionError: () => setActionError(''),
  };
}
