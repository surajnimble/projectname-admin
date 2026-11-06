import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { ApiKeyList } from '@/components/platform-operations/api-key-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
export const metadata: Metadata = { title: MESSAGES.platformOperations.apiKeys.title };
export default function ApiKeysPage() {
  return <PermissionGuard permission={PERMISSIONS.apiKeyManage}><ApiKeyList /></PermissionGuard>;
}
