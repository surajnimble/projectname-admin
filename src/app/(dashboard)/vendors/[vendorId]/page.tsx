import type { Metadata } from 'next';
import { VendorDetails } from '@/components/vendor/vendor-details';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.vendors.title };

export default async function VendorDetailsPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  return <VendorDetails vendorId={vendorId} />;
}
