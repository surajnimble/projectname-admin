'use client';

import { Ban, Check, Percent, RotateCcw, X } from 'lucide-react';
import { DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity, DataTableMedia } from '@/components/common/data-table-media';
import { StatusBadge, vendorStatusMeta } from '@/components/common/status-badge';
import { Badge } from '@/components/ui/badge';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { ROUTES, VENDOR_STATUSES } from '@/constants';
import type { VendorAction } from '@/lib/api/vendor-actions';
import type { VendorData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

const documentState = (vendor: VendorData) => {
  if (vendor.documentsVerifiedAt) return vendors.documentsVerified;
  if (vendor.isDocumentsSubmitted) return vendors.documentsSubmitted;
  return vendors.documentsMissing;
};

export const vendorColumns: readonly DataTableColumn<VendorData>[] = [
  {
    key: 'shop',
    header: vendors.columns.shop,
    cell: (vendor) => (
      <div className="flex items-center gap-3">
        <DataTableMedia sources={vendor.logo ? [vendor.logo] : []} alt={vendor.shopName || ''} />
        <DataTableIdentity
          title={vendor.shopName || vendors.shopFallback}
          meta={vendor.userData.email || vendors.ownerFallback}
          href={ROUTES.vendorDetails(vendor.vendorId)}
        />
      </div>
    ),
  },
  {
    key: 'status',
    header: vendors.columns.status,
    align: 'center',
    width: 'w-32',
    cell: (vendor) => <StatusBadge meta={vendorStatusMeta(vendor.status)} />,
  },
  {
    key: 'rating',
    header: vendors.columns.rating,
    hideBelow: 'sm',
    numeric: true,
    cell: (vendor) => (
      <span className="block whitespace-nowrap">
        {vendors.rating(vendor.rating)}
        {vendor.ratingCount > 0 && (
          <span className="text-fg-muted ml-1 text-xs">({vendor.ratingCount})</span>
        )}
      </span>
    ),
  },
  {
    key: 'commission',
    header: vendors.columns.commission,
    hideBelow: 'md',
    numeric: true,
    cell: (vendor) => <span className="block">{vendors.commission(vendor.commissionRate)}</span>,
  },
  {
    key: 'pendingPayout',
    header: vendors.columns.pendingPayout,
    hideBelow: 'lg',
    numeric: true,
    cell: (vendor) => (
      <span className="block whitespace-nowrap">
        {vendor.pendingAmount > 0 ? formatCurrency(vendor.pendingAmount) : vendors.dash}
      </span>
    ),
  },
  {
    key: 'documents',
    header: vendors.columns.documents,
    hideBelow: 'lg',
    cell: (vendor) => (
      <Badge intent={vendor.documentsVerifiedAt ? 'success' : 'neutral'}>
        {documentState(vendor)}
      </Badge>
    ),
  },
  {
    key: 'joined',
    header: vendors.columns.joined,
    hideBelow: 'xl',
    cell: (vendor) => (
      <span className="text-fg-muted block whitespace-nowrap">
        {formatRelativeTime(vendor.createdAt)}
      </span>
    ),
  },
];

interface VendorRowActionsProps {
  vendor: VendorData;
  onAction: (vendor: VendorData, action: VendorAction) => void;
}

export function VendorRowActions({ vendor, onAction }: VendorRowActionsProps) {
  const items: OptionsMenuItem[] = [];

  if (vendor.status === VENDOR_STATUSES.pending) {
    items.push({
      label: vendors.approve,
      icon: Check,
      onSelect: () => onAction(vendor, 'approve'),
    });
    items.push({
      label: vendors.reject,
      icon: X,
      intent: 'danger',
      onSelect: () => onAction(vendor, 'reject'),
    });
  }

  if (vendor.status === VENDOR_STATUSES.approved) {
    items.push({
      label: vendors.commissionAction,
      icon: Percent,
      onSelect: () => onAction(vendor, 'commission'),
    });
    items.push({
      label: vendors.suspend,
      icon: Ban,
      intent: 'danger',
      onSelect: () => onAction(vendor, 'suspend'),
    });
  }

  if (vendor.status === VENDOR_STATUSES.suspended) {
    items.push({
      label: vendors.reactivate,
      icon: RotateCcw,
      onSelect: () => onAction(vendor, 'reactivate'),
    });
  }

  if (items.length === 0) return null;

  return (
    <OptionsMenu
      label={vendors.rowActionsLabel}
      items={items}
      className="flex justify-end"
    />
  );
}
