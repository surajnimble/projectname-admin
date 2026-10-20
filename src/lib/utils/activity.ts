import type { ActivityLogData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const {
  activityActions: actions,
  activityEvents: events,
  activityFacts: labels,
  activityMethods: methods,
} = MESSAGES.dashboard;

export interface ActivityDescription {
  title: string;
  facts: string[];
}

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asCount = (value: unknown): number | null =>
  Array.isArray(value) ? value.length : asNumber(value);

const humanize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());

const humanizeEntity = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());

const methodLabel = (value: string): string =>
  value ? (methods[value] ?? methods[value.toUpperCase()] ?? humanize(value)) : '';

const transition = (from: unknown, to: unknown): string => {
  const start = humanize(asText(from));
  const end = humanize(asText(to));
  if (start && end) return `${start} → ${end}`;
  return start || end;
};

const push = (target: string[], ...values: string[]) => {
  for (const value of values) if (value) target.push(value);
};

const metaFacts = (meta: Record<string, unknown>): string[] => {
  const parts: string[] = [];
  push(parts, formatCurrency(meta.amount), formatCurrency(meta.total));
  const orderNumber = asText(meta.orderNumber);
  if (orderNumber) parts.push(`#${orderNumber}`);
  const ticketNumber = asText(meta.ticketNumber);
  if (ticketNumber) parts.push(`#${ticketNumber}`);
  push(parts, asText(meta.reason));
  return parts;
};

export function describeActivity(activity: ActivityLogData): ActivityDescription {
  const { action, meta } = activity;
  const name = activity.userData.name || activity.userData.email;
  const facts: string[] = [];
  let title = '';

  switch (action) {
    case 'REGISTER': {
      const type = asText(meta.type);
      title = events.userRegistered;
      push(
        facts,
        name,
        type === 'CUSTOMER' ? labels.customer : type === 'VENDOR' ? labels.vendor : humanize(type),
      );
      break;
    }
    case 'LOGIN': {
      title = meta.isNewDevice === true ? events.signedInNewDevice : events.signedIn;
      push(
        facts,
        name || MESSAGES.dashboard.activityUser,
        asText(activity.ip) || methodLabel(asText(meta.method)),
      );
      break;
    }
    case 'LOGOUT': {
      title = events.signedOut;
      push(
        facts,
        name || MESSAGES.dashboard.activityUser,
        meta.allDevices === true ? labels.allDevices : '',
      );
      break;
    }
    case 'LOGIN_LOCKED': {
      title = events.loginBlocked;
      push(facts, name || MESSAGES.dashboard.activityUser);
      break;
    }
    case 'OTP_SENT': {
      title = events.otpSent;
      push(facts, name, methodLabel(asText(meta.channel)));
      break;
    }
    case 'ORDER_PLACED': {
      const orderNumber = asText(meta.orderNumber);
      const vendorCount = asCount(meta.vendors);
      title = events.orderPlaced(orderNumber);
      push(facts, name, formatCurrency(meta.total), vendorCount ? labels.vendors(vendorCount) : '');
      break;
    }
    case 'ORDER_STATUS_UPDATED': {
      title = events.orderStatusUpdated;
      push(facts, transition(meta.from, meta.to), name);
      break;
    }
    case 'ORDER_CANCELLED': {
      title = events.orderCancelled;
      push(facts, name, asText(meta.reason));
      break;
    }
    case 'PAYMENT_CONFIRMED': {
      title = events.paymentReceived(formatCurrency(meta.amount));
      push(facts, name);
      break;
    }
    case 'PAYMENT_SUBMITTED': {
      title = events.paymentSubmitted;
      push(facts, name, formatCurrency(meta.amount), methodLabel(asText(meta.method)));
      break;
    }
    case 'PRODUCT_CREATED': {
      title = events.productCreated;
      push(facts, asText(meta.name), name);
      break;
    }
    case 'TICKET_CREATED': {
      title = events.ticketCreated(asText(meta.ticketNumber));
      push(facts, name);
      break;
    }
    case 'TICKET_REPLIED': {
      title = events.ticketReplied;
      push(facts, name, meta.isInternal === true ? labels.internalNote : labels.customerReply);
      break;
    }
    case 'ORDERS_IMPORTED': {
      const succeeded = asNumber(meta.successCount);
      const failed = asNumber(meta.failCount);
      title = events.ordersImported;
      push(
        facts,
        name,
        succeeded !== null ? labels.succeeded(succeeded) : '',
        failed !== null ? labels.failed(failed) : '',
      );
      break;
    }
    case 'CUSTOMER_DATA_EXPORTED': {
      title = events.customerDataExported;
      push(facts, name);
      break;
    }
    case 'WALLET_ADJUSTED': {
      const balance = formatCurrency(meta.balanceAfter);
      title = events.walletAdjusted;
      push(facts, name, formatCurrency(meta.amount), balance ? labels.balanceAfter(balance) : '');
      break;
    }
    case 'PAYOUT_REQUESTED': {
      title = events.payoutRequested;
      push(facts, name, formatCurrency(meta.amount), methodLabel(asText(meta.method)));
      break;
    }
    case 'RETURN_REQUESTED': {
      const refund = formatCurrency(meta.refundAmount);
      const itemCount = asCount(meta.items);
      title = events.returnRequested;
      push(
        facts,
        name,
        refund ? labels.refund(refund) : '',
        itemCount ? labels.items(itemCount) : '',
      );
      break;
    }
    case 'USER_BLOCKED': {
      title = events.userBlocked;
      push(facts, name);
      break;
    }
    case 'REVIEW_ADDED': {
      const rating = asNumber(meta.rating);
      title = events.reviewAdded;
      push(facts, rating !== null ? labels.rating(rating) : '', name);
      break;
    }
    case 'REVIEW_MODERATED': {
      title = events.reviewModerated;
      push(facts, transition(meta.from, meta.to), name);
      break;
    }
    case 'PROFILE_UPDATED': {
      const fields = Array.isArray(meta.fields) ? meta.fields.length : null;
      title = events.profileUpdated;
      push(facts, name, fields ? labels.fieldsUpdated(fields) : '');
      break;
    }
    default: {
      const verb = actions[action];
      const entity = humanizeEntity(activity.entity);
      title = verb && entity ? `${entity} ${verb}` : humanize(action);
      push(facts, name, ...metaFacts(meta));
    }
  }

  return { title: title || MESSAGES.dashboard.activityFallback, facts };
}
