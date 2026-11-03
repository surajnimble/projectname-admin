import type { CronJobData, CronJobListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawCronJobList = Partial<
  Record<keyof Omit<CronJobListData, 'itemList'>, unknown>
> & {
  jobList?: unknown;
};

export const toCronJobList = (raw: RawCronJobList = {}): CronJobListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.jobList)
    ? raw.jobList.filter(isObject).map((item) => ({
        name: toString(item.name),
        queue: toString(item.queue),
        job: toString(item.job),
        cron: toString(item.cron),
        description: toString(item.description),
        nextRunAt: toString(item.nextRunAt),
        isRegistered: toBoolean(item.isRegistered),
      }))
    : [],
});
