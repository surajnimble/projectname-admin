import type { Metadata } from 'next';
import { VendorPage } from '@/components/vendor/vendor-page';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.vendors.title };

export default function VendorsPage() {
  return <VendorPage />;
}
