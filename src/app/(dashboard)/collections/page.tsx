import type { Metadata } from 'next';
import ClientCollectionsPage from './ClientPage';

export const metadata: Metadata = { title: 'Collections' };

export default function CollectionsPage() {
  return <ClientCollectionsPage />;
}
