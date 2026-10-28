import {
  Activity,
  ArrowRight,
  Ban,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  IndianRupee,
  KeyRound,
  LifeBuoy,
  Lock,
  LogIn,
  LogOut,
  MessageSquare,
  PackageCheck,
  PackagePlus,
  PackageX,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Star,
  ToggleRight,
  Trash2,
  Upload,
  UserCog,
  UserPlus,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RECENT_ACTIVITY_LIMIT } from '@/constants';
import { describeActivity } from '@/lib/utils/activity';
import type { ActivityLogData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const { dashboard } = MESSAGES;

type ActivityIntent = 'primary' | 'info' | 'success' | 'warning' | 'danger';

interface ActionMeta {
  icon: LucideIcon;
  intent: ActivityIntent;
}

const ACTION_META: Record<string, ActionMeta> = {
  REGISTER: { icon: UserPlus, intent: 'success' },
  LOGIN: { icon: LogIn, intent: 'info' },
  LOGOUT: { icon: LogOut, intent: 'info' },
  LOGIN_LOCKED: { icon: Lock, intent: 'danger' },
  OTP_SENT: { icon: KeyRound, intent: 'info' },
  ORDER_PLACED: { icon: ShoppingBag, intent: 'primary' },
  ORDER_STATUS_UPDATED: { icon: PackageCheck, intent: 'info' },
  ORDER_CANCELLED: { icon: PackageX, intent: 'danger' },
  PAYMENT_CONFIRMED: { icon: IndianRupee, intent: 'success' },
  PAYMENT_SUBMITTED: { icon: CreditCard, intent: 'info' },
  PRODUCT_CREATED: { icon: PackagePlus, intent: 'success' },
  TICKET_CREATED: { icon: LifeBuoy, intent: 'info' },
  TICKET_REPLIED: { icon: MessageSquare, intent: 'info' },
  ORDERS_IMPORTED: { icon: Upload, intent: 'info' },
  CUSTOMER_DATA_EXPORTED: { icon: Download, intent: 'warning' },
  WALLET_ADJUSTED: { icon: Wallet, intent: 'info' },
  PAYOUT_REQUESTED: { icon: Banknote, intent: 'warning' },
  RETURN_REQUESTED: { icon: RotateCcw, intent: 'warning' },
  USER_BLOCKED: { icon: Ban, intent: 'danger' },
  REVIEW_ADDED: { icon: Star, intent: 'warning' },
  REVIEW_MODERATED: { icon: ShieldCheck, intent: 'info' },
  PROFILE_UPDATED: { icon: UserCog, intent: 'info' },
  CREATE: { icon: Plus, intent: 'success' },
  UPDATE: { icon: Pencil, intent: 'info' },
  DELETE: { icon: Trash2, intent: 'danger' },
  APPROVE: { icon: Check, intent: 'success' },
  REJECT: { icon: X, intent: 'danger' },
  SUSPEND: { icon: Ban, intent: 'danger' },
  ACTIVATE: { icon: CheckCircle2, intent: 'success' },
  EXPORT: { icon: Download, intent: 'info' },
  IMPORT: { icon: Upload, intent: 'info' },
  SEND: { icon: Send, intent: 'info' },
  TOGGLE: { icon: ToggleRight, intent: 'info' },
  RESET: { icon: RotateCcw, intent: 'warning' },
  IMPERSONATE: { icon: UserCog, intent: 'warning' },
};

const DEFAULT_META: ActionMeta = { icon: Activity, intent: 'primary' };

const INTENT_CLASSES: Record<ActivityIntent, string> = {
  primary: 'bg-soft text-soft-fg',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
};

export function ActivityItem({ activity }: { activity: ActivityLogData }) {
  const meta = ACTION_META[activity.action] ?? DEFAULT_META;
  const Icon = meta.icon;
  const { title, facts } = describeActivity(activity);
  const time = formatRelativeTime(activity.createdAt);

  return (
    <li className="flex items-start gap-3 px-5 py-4 transition-colors" data-hover-color>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          INTENT_CLASSES[meta.intent],
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-fg text-sm font-semibold leading-snug">{title}</p>
        <p className="text-fg-muted text-xs leading-relaxed">
          {facts.join(' · ')}
          {facts.length > 0 && time && ' · '}
          <time dateTime={activity.createdAt}>{time}</time>
        </p>
      </div>
    </li>
  );
}

interface RecentActivityProps {
  items: ActivityLogData[];
  isLoading: boolean;
  error: string;
  hasMore: boolean;
  onRetry: () => void;
  onViewAll: () => void;
}

export function RecentActivity({
  items,
  isLoading,
  error,
  hasMore,
  onRetry,
  onViewAll,
}: RecentActivityProps) {
  return (
    <Card className="self-start overflow-hidden">
      <CardHeader className="border-border flex flex-row items-center justify-between gap-3 border-b p-5">
        <CardTitle>{dashboard.activityTitle}</CardTitle>
        {hasMore && (
          <Button variant="ghost" size="sm" className="-mr-2 px-2" onClick={onViewAll}>
            {MESSAGES.common.viewAll}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </CardHeader>
      {isLoading ? (
        <div className="divide-border divide-y" role="status" aria-busy="true">
          <span className="sr-only">{MESSAGES.common.loading}</span>
          {Array.from({ length: RECENT_ACTIVITY_LIMIT }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 px-5 py-4">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-5">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title={dashboard.activityEmptyTitle}
            description={dashboard.activityEmptyBody}
          />
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {items.map((activity) => (
            <ActivityItem key={activity.activityLogId} activity={activity} />
          ))}
        </ul>
      )}
    </Card>
  );
}
