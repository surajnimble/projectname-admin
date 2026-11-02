import type { Metadata } from 'next';
import ClientReviewsPage from './ClientPage';

export const metadata: Metadata = { title: 'Product Reviews' };

export default function ReviewsPage() {
  return <ClientReviewsPage />;
}
