import type {
  FeatureFlagsData,
  MaintenanceStatusData,
  SettingData,
  SettingListData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toSetting = (raw: Record<string, unknown>): SettingData => ({
  settingId: toString(raw.settingId),
  key: toString(raw.key),
  value: typeof raw.value === 'string' || typeof raw.value === 'number' || typeof raw.value === 'boolean' ? raw.value : '',
  category: toString(raw.category),
  isPublic: toBoolean(raw.isPublic),
  updatedBy: toString(raw.updatedBy),
  updatedAt: toString(raw.updatedAt),
});

type RawSettingList = Partial<Record<keyof Omit<SettingListData, 'itemList'>, unknown>> & {
  systemSettingList?: unknown;
};

export const toSettingList = (raw: RawSettingList = {}): SettingListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: toBoolean(raw.hasNext),
  hasPrevious: toBoolean(raw.hasPrevious),
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.systemSettingList)
    ? raw.systemSettingList.filter(isObject).map((item) => toSetting(item))
    : [],
});

export const toFeatureFlags = (
  raw: Record<string, unknown> = {},
): FeatureFlagsData => {
  const flags: FeatureFlagsData = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'boolean') {
      flags[key] = value;
    }
  }
  return flags;
};

export const toMaintenanceStatus = (
  raw: Record<string, unknown> = {},
): MaintenanceStatusData => ({
  enabled: toBoolean(raw.enabled),
  message: toString(raw.message),
  allowedIps: Array.isArray(raw.allowedIps)
    ? raw.allowedIps.filter((ip): ip is string => typeof ip === 'string')
    : [],
});
