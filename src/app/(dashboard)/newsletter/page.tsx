import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { NewsletterList } from '@/components/newsletter/newsletter-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.newsletter };

export default function NewsletterPage() {
  return <PermissionGuard permission={PERMISSIONS.newsletterManage}><NewsletterList /></PermissionGuard>;
}
