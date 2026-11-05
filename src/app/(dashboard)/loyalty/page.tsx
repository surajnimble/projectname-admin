import type { Metadata } from 'next';
import { LoyaltyPage } from '@/components/engagement/loyalty-page';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = {
  title: MESSAGES.loyalty.title,
};

export default function LoyaltyPageWrapper() {
  return <LoyaltyPage />;
}
