import type { Metadata } from 'next';
import ClientFaqsPage from './ClientPage';

export const metadata: Metadata = { title: 'FAQs' };

export default function FaqsPage() {
  return <ClientFaqsPage />;
}
