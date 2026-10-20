import { DEVICE_HEADERS, PLATFORM, SITE } from '@/constants';
import { getDeviceId } from './session';

export function buildDeviceHeaders(): Record<string, string> {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  return {
    [DEVICE_HEADERS.id]: getDeviceId(),
    [DEVICE_HEADERS.platform]: PLATFORM,
    [DEVICE_HEADERS.appVersion]: SITE.appVersion,
    [DEVICE_HEADERS.model]: nav?.platform || 'browser',
    [DEVICE_HEADERS.locale]: nav?.language || 'en',
    [DEVICE_HEADERS.timezone]: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
}