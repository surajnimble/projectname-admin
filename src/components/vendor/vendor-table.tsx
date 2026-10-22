'use client';

import { Ban, Check, Percent, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, vendorStatusMeta } from '@/components/common/status-badge';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Thumbnail } from '@/components/ui/thumbnail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

function VendorRowActions({
  vendor,
  onAction,
}: {
  vendor: VendorData;
  onAction: (vendor: VendorData, action: VendorAction) => void;
}) {
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

interface VendorTableProps {
  vendors: VendorData[];
  onAction: (vendor: VendorData, action: VendorAction) => void;
}

export function VendorTable({ vendors: items, onAction }: VendorTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{vendors.columns.shop}</TableHead>
          <TableHead className="w-32 text-center">{vendors.columns.status}</TableHead>
          <TableHead className="hidden sm:table-cell">{vendors.columns.rating}</TableHead>
          <TableHead className="hidden md:table-cell">{vendors.columns.commission}</TableHead>
          <TableHead className="hidden lg:table-cell">{vendors.columns.pendingPayout}</TableHead>
          <TableHead className="hidden lg:table-cell">{vendors.columns.documents}</TableHead>
          <TableHead className="hidden xl:table-cell">{vendors.columns.joined}</TableHead>
          <TableHead className="text-right">{vendors.columns.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((vendor) => (
            <TableRow
              key={vendor.vendorId}
              className="hover:bg-hover relative cursor-pointer transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Thumbnail src={vendor.logo} alt={vendor.shopName || vendors.shopFallback} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      href={ROUTES.vendorDetails(vendor.vendorId)}
                      className="text-primary after:absolute after:inset-0 block max-w-32 truncate font-medium hover:underline sm:max-w-56 lg:max-w-none"
                    >
                      {vendor.shopName || vendors.shopFallback}
                    </Link>
                  <span className="text-fg-muted block max-w-32 truncate text-xs sm:max-w-56 lg:max-w-none">
                    {vendor.userData.email || vendors.ownerFallback}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="w-32 text-center">
              <StatusBadge meta={vendorStatusMeta(vendor.status)} />
            </TableCell>
            <TableCell className="hidden tabular-nums sm:table-cell">
              {vendors.rating(vendor.rating)}
              {vendor.ratingCount > 0 && (
                <span className="text-fg-muted ml-1 text-xs">({vendor.ratingCount})</span>
              )}
            </TableCell>
            <TableCell className="hidden tabular-nums md:table-cell">
              {vendors.commission(vendor.commissionRate)}
            </TableCell>
            <TableCell className="hidden tabular-nums lg:table-cell">
              {vendor.pendingAmount > 0 ? formatCurrency(vendor.pendingAmount) : vendors.dash}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <Badge intent={vendor.documentsVerifiedAt ? 'success' : 'neutral'}>
                {documentState(vendor)}
              </Badge>
            </TableCell>
            <TableCell className="text-fg-muted hidden whitespace-nowrap xl:table-cell">
              {formatRelativeTime(vendor.createdAt)}
            </TableCell>
            <TableCell className="relative z-10">
              <VendorRowActions vendor={vendor} onAction={onAction} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
