import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { ReferralList } from '@/components/referrals/referral-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.referrals };

export default function ReferralsPage() {
  return <PermissionGuard permission={PERMISSIONS.referralManage}><ReferralList /></PermissionGuard>;
}
