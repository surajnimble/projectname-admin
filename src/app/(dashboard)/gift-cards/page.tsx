import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { GiftCardList } from '@/components/gift-cards/gift-card-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.giftCards };

export default function GiftCardsPage() {
  return <PermissionGuard permission={PERMISSIONS.giftCardManage}><GiftCardList /></PermissionGuard>;
}
