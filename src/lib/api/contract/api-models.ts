// Standalone data models that are not part of a request or response envelope —
// the app's own static shapes (mirrors Android's `data/models/`). Keep request
// fields in `api-request.ts` and envelope payloads in `base-response.ts`.

import type {
  AnalyticsAppVersionData,
  AnalyticsCrashData,
  AnalyticsConversionData,
  AnalyticsDeviceData,
  AnalyticsGeoData,
  AnalyticsPageViewData,
  AnalyticsSessionData,
  AnalyticsTrafficSourceData,
  AnalyticsVisitorData,
  PageData,
} from './base-response';

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
}

/* ---------- Analytics (paginated lists) ---------- */

export type AnalyticsVisitorListData = PageData<AnalyticsVisitorData>;
export type AnalyticsPageItemListData = PageData<AnalyticsPageViewData>;
export type AnalyticsTrafficListData = PageData<AnalyticsTrafficSourceData>;
export type AnalyticsDeviceListData = PageData<AnalyticsDeviceData>;
export type AnalyticsGeoListData = PageData<AnalyticsGeoData>;
export type AnalyticsConversionListData = PageData<AnalyticsConversionData>;
export type AnalyticsCrashListData = PageData<AnalyticsCrashData>;
export type AnalyticsAppVersionListData = PageData<AnalyticsAppVersionData>;
export type AnalyticsSessionListData = PageData<AnalyticsSessionData>;