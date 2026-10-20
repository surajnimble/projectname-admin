import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or was moved."
        action={
          <Link href={ROUTES.home} className={buttonVariants({ variant: 'primary' })}>
            Go to overview
          </Link>
        }
      />
    </div>
  );
}
