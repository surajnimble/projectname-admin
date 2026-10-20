import type { Metadata } from 'next';
import ClientBannersPage from './ClientPage';

export const metadata: Metadata = { title: 'Banners' };

export default function BannersPage() {
  return <ClientBannersPage />;
}
