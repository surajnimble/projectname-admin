import type { Metadata } from 'next';
import { ReferralPage } from '@/components/engagement/referral-page';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = {
  title: MESSAGES.referral.title,
};

export default function ReferralPageWrapper() {
  return <ReferralPage />;
}
