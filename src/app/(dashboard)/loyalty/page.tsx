import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { LoyaltyProgram } from '@/components/loyalty/loyalty-program';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.loyalty };

export default function LoyaltyPage() {
  return <PermissionGuard permission={PERMISSIONS.loyaltyManage}><LoyaltyProgram /></PermissionGuard>;
}
