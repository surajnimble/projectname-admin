import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata = { title: 'Maintenance' };

export default function MaintenancePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        title="We'll be right back"
        description="The platform is undergoing maintenance. Try again in a few minutes."
        action={
          <Link href={ROUTES.home} className={buttonVariants({ variant: 'outline' })}>
            {MESSAGES.common.retry}
          </Link>
        }
      />
    </div>
  );
}
