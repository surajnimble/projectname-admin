import type { FailedJobData, FailedJobListData, FailedJobStatsData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawFailedJobList = Partial<
  Record<keyof Omit<FailedJobListData, 'itemList'>, unknown>
> & {
  failedJobList?: unknown;
};

export const toFailedJobList = (raw: RawFailedJobList = {}): FailedJobListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.failedJobList)
    ? raw.failedJobList.filter(isObject).map((item) => ({
        failedJobId: toString(item.failedJobId),
        jobName: toString(item.jobName),
        queue: toString(item.queue),
        attempt: toNumber(item.attempt),
        maxAttempts: toNumber(item.maxAttempts),
        lastError: toString(item.lastError),
        failedAt: toString(item.failedAt),
        status: toString(item.status),
      }))
    : [],
});

export const toFailedJobStats = (
  raw: Record<string, unknown> = {},
): FailedJobStatsData => ({
  pendingCount: toNumber(raw.pendingCount),
  resolvedCount: toNumber(raw.resolvedCount),
  abandonedCount: toNumber(raw.abandonedCount),
});
