import type {
  AdminApiKeyData,
  AdminApiKeyListData,
  AdminDeviceData,
  AdminDeviceListData,
  AdminWebhookData,
  AdminWebhookListData,
  AdminWebhookLogData,
  AdminWebhookLogListData,
  CountryData,
  CountryListData,
  CurrencyData,
  CurrencyListData,
  TaxConfigData,
  TaxConfigListData,
} from '@/lib/api/contract';

const obj = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const num = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
const bool = (value: unknown): boolean => value === true;
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const page = (raw: Record<string, unknown>) => ({
  totalRecord: num(raw.totalRecord),
  totalPage: num(raw.totalPage),
  currentPage: num(raw.currentPage),
  limit: num(raw.limit),
  hasNext: bool(raw.hasNext),
  hasPrevious: bool(raw.hasPrevious),
  nextPage: num(raw.nextPage),
  previousPage: num(raw.previousPage),
});

export const toAdminDevice = (value: unknown): AdminDeviceData => {
  const raw = obj(value);
  return {
    deviceId: str(raw.deviceId), recordId: str(raw.recordId), userId: str(raw.userId),
    platform: str(raw.platform), os: str(raw.os), osVersion: str(raw.osVersion),
    browser: str(raw.browser), browserVersion: str(raw.browserVersion), model: str(raw.model),
    manufacturer: str(raw.manufacturer), appVersion: str(raw.appVersion), locale: str(raw.locale),
    timezone: str(raw.timezone), ip: str(raw.ip), isBlocked: bool(raw.isBlocked),
    isTrusted: bool(raw.isTrusted), lastSeenAt: str(raw.lastSeenAt), createdAt: str(raw.createdAt),
  };
};
export const toAdminDeviceList = (value: unknown): AdminDeviceListData => {
  const raw = obj(value);
  return {
    ...page(raw),
    itemList: (Array.isArray(raw.deviceList) ? raw.deviceList : []).map(toAdminDevice),
  };
};

export const toAdminApiKey = (value: unknown): AdminApiKeyData => {
  const raw = obj(value);
  return {
    apiKeyId: str(raw.apiKeyId ?? raw.id), name: str(raw.name), key: str(raw.key),
    prefix: str(raw.prefix), scopes: strings(raw.scopes), isActive: bool(raw.isActive),
    usageCount: num(raw.usageCount), auditedCallCount: num(raw.auditedCallCount),
    lastUsedAt: str(raw.lastUsedAt), expiresAt: str(raw.expiresAt), revokedAt: str(raw.revokedAt),
    createdAt: str(raw.createdAt), secret: str(raw.secret), note: str(raw.note),
  };
};
export const toAdminApiKeyList = (value: unknown): AdminApiKeyListData => {
  const raw = obj(value);
  return {
    itemCount: num(raw.itemCount),
    apiKeyList: (Array.isArray(raw.apiKeyList) ? raw.apiKeyList : []).map(toAdminApiKey),
  };
};

export const toAdminWebhook = (value: unknown): AdminWebhookData => {
  const raw = obj(value);
  return {
    webhookId: str(raw.webhookId ?? raw.id), url: str(raw.url), events: strings(raw.events),
    provider: str(raw.provider), isActive: bool(raw.isActive), failureCount: num(raw.failureCount),
    lastFiredAt: str(raw.lastFiredAt), createdAt: str(raw.createdAt),
    secret: str(raw.secret), note: str(raw.note),
  };
};
export const toAdminWebhookList = (value: unknown): AdminWebhookListData => {
  const raw = obj(value);
  return {
    ...page(raw),
    itemList: (Array.isArray(raw.webhookList) ? raw.webhookList : []).map(toAdminWebhook),
  };
};
export const toAdminWebhookLog = (value: unknown): AdminWebhookLogData => {
  const raw = obj(value);
  return {
    webhookLogId: str(raw.webhookLogId), endpointId: str(raw.endpointId),
    direction: str(raw.direction), provider: str(raw.provider), event: str(raw.event),
    eventId: str(raw.eventId), payload: raw.payload, statusCode: num(raw.statusCode),
    isProcessed: bool(raw.isProcessed), error: str(raw.error), durationMs: num(raw.durationMs),
    createdAt: str(raw.createdAt),
  };
};
export const toAdminWebhookLogList = (value: unknown): AdminWebhookLogListData => {
  const raw = obj(value);
  return {
    ...page(raw),
    itemList: (Array.isArray(raw.webhookLogList) ? raw.webhookLogList : []).map(toAdminWebhookLog),
  };
};

export const toCurrency = (value: unknown): CurrencyData => {
  const raw = obj(value);
  return {
    currencyId: str(raw.currencyId ?? raw.id), code: str(raw.code), name: str(raw.name),
    symbol: str(raw.symbol), decimals: num(raw.decimals), rate: num(raw.rate),
    isDefault: bool(raw.isDefault), isActive: bool(raw.isActive), createdAt: str(raw.createdAt),
  };
};
export const toCurrencyList = (value: unknown): CurrencyListData => {
  const raw = obj(value);
  return { currencyList: (Array.isArray(raw.currencyList) ? raw.currencyList : []).map(toCurrency), totalRecord: num(raw.totalRecord) };
};
export const toTaxConfig = (value: unknown): TaxConfigData => {
  const raw = obj(value);
  return {
    taxConfigId: str(raw.taxConfigId ?? raw.id), name: str(raw.name), slug: str(raw.slug),
    percent: num(raw.percent), cgstPercent: num(raw.cgstPercent), sgstPercent: num(raw.sgstPercent),
    igstPercent: num(raw.igstPercent), isInclusive: bool(raw.isInclusive),
    vendorId: str(raw.vendorId), stateCode: str(raw.stateCode), isActive: bool(raw.isActive),
    createdAt: str(raw.createdAt),
  };
};
export const toTaxConfigList = (value: unknown): TaxConfigListData => {
  const raw = obj(value);
  return { taxConfigList: (Array.isArray(raw.taxConfigList) ? raw.taxConfigList : []).map(toTaxConfig), totalRecord: num(raw.totalRecord) };
};
export const toCountry = (value: unknown): CountryData => {
  const raw = obj(value);
  const states = Array.isArray(raw.stateList) ? raw.stateList : [];
  return {
    countryId: str(raw.countryId), code: str(raw.code), name: str(raw.name), dialCode: str(raw.dialCode),
    currency: str(raw.currency), isActive: bool(raw.isActive), stateCount: num(raw.stateCount),
    stateList: states.map((item) => {
      const state = obj(item);
      return { stateId: str(state.stateId), code: str(state.code), name: str(state.name), isActive: bool(state.isActive) };
    }),
  };
};
export const toCountryList = (value: unknown): CountryListData => {
  const raw = obj(value);
  return { ...page(raw), itemList: (Array.isArray(raw.countryList) ? raw.countryList : []).map(toCountry) };
};
