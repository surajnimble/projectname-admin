import type { Metadata } from 'next';
import ClientBrandsPage from './ClientPage';

export const metadata: Metadata = { title: 'Brands' };

export default function BrandsPage() {
  return <ClientBrandsPage />;
}
