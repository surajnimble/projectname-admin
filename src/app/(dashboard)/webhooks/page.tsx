import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { WebhookManager } from '@/components/platform-operations/webhook-manager';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
export const metadata: Metadata = { title: MESSAGES.platformOperations.webhooks.title };
export default function WebhooksPage() {
  return <PermissionGuard permission={PERMISSIONS.webhookManage}><WebhookManager /></PermissionGuard>;
}
