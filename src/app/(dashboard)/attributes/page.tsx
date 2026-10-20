import type { Metadata } from 'next';
import ClientAttributesPage from './ClientPage';

export const metadata: Metadata = { title: 'Attributes' };

export default function AttributesPage() {
  return <ClientAttributesPage />;
}
