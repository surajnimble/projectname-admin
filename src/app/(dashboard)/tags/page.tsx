import type { Metadata } from 'next';
import ClientTagsPage from './ClientPage';

export const metadata: Metadata = { title: 'Tags' };

export default function TagsPage() {
  return <ClientTagsPage />;
}
