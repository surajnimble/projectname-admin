import { Badge, type BadgeProps } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { MESSAGES } from '@/messages';

type BadgeIntent = NonNullable<BadgeProps['intent']>;

export interface StatusMeta {
  label: string;
  intent: BadgeIntent;
}

const VENDOR_INTENTS: Record<string, BadgeIntent> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
  INACTIVE: 'neutral',
};

const PRODUCT_INTENTS: Record<string, BadgeIntent> = {
  DRAFT: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  ARCHIVED: 'danger',
};

export const vendorStatusMeta = (status: string): StatusMeta => ({
  label: MESSAGES.vendors.statuses[status as keyof typeof MESSAGES.vendors.statuses] ?? status,
  intent: VENDOR_INTENTS[status] ?? 'neutral',
});

export const productStatusMeta = (status: string): StatusMeta => ({
  label: MESSAGES.products.statuses[status as keyof typeof MESSAGES.products.statuses] ?? status,
  intent: PRODUCT_INTENTS[status] ?? 'neutral',
});

interface StatusBadgeProps {
  meta: StatusMeta;
  className?: string;
}

export function StatusBadge({ meta, className }: StatusBadgeProps) {
  return (
    <>
      <span className={className ?? 'sm:hidden'}>
        <StatusDot intent={meta.intent} label={meta.label} />
      </span>
      <span className={className ? `hidden sm:inline ${className}` : 'hidden sm:inline'}>
        <Badge intent={meta.intent}>{meta.label}</Badge>
      </span>
    </>
  );
}
