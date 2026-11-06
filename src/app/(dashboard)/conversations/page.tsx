import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { ChatReview } from '@/components/chat/chat-review';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.chat.title };

export default function ConversationsPage() {
  return <PermissionGuard permission={PERMISSIONS.chatView}><ChatReview /></PermissionGuard>;
}
