import type { Metadata } from 'next';
import ClientQuestionsPage from './ClientPage';

export const metadata: Metadata = { title: 'Product Questions' };

export default function QuestionsPage() {
  return <ClientQuestionsPage />;
}
