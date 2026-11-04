import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { QuestionList } from '@/components/questions/question-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.questions };

export default function QuestionsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.questionManage}>
      <QuestionList />
    </PermissionGuard>
  );
}
