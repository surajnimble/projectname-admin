import type { Metadata } from 'next';
import ClientBlogsPage from './ClientPage';

export const metadata: Metadata = { title: 'Blogs' };

export default function BlogsPage() {
  return <ClientBlogsPage />;
}
