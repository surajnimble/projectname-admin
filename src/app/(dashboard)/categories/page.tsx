import type { Metadata } from 'next';
import ClientCategoriesPage from './ClientPage';

export const metadata: Metadata = { title: 'Categories' };

export default function CategoriesPage() {
  return <ClientCategoriesPage />;
}
