import type { Metadata } from 'next';
import { RegionalSettings } from '@/components/platform-operations/regional-settings';
import { MESSAGES } from '@/messages';
export const metadata: Metadata = { title: MESSAGES.platformOperations.regional.title };
export default function RegionalSettingsPage() {
  return <RegionalSettings />;
}
