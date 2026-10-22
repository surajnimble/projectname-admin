import type { Metadata } from 'next';
import { ProductDetails } from '@/components/product/product-details';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.products.title };

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ vendorId: string; productId: string }>;
}) {
  const { vendorId, productId } = await params;
  return <ProductDetails vendorId={vendorId} productId={productId} />;
}
