import type { Metadata } from 'next';
import ClientPagesPage from './ClientPage';

export const metadata: Metadata = { title: 'Pages' };

export default function PagesPage() {
  return <ClientPagesPage />;
}
