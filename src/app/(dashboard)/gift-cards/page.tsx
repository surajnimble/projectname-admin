import type { Metadata } from 'next';
import { GiftCardPage } from '@/components/engagement/gift-card-page';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = {
  title: MESSAGES.giftCard.title,
};

export default function GiftCardPageWrapper() {
  return <GiftCardPage />;
}
