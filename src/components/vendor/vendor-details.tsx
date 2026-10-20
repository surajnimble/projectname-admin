'use client';

import { ArrowLeft, Ban, Check, ExternalLink, Package, Percent, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { VendorActionDialog } from '@/components/vendor/vendor-action-dialog';
import {
  VendorDocumentDialog,
  type DocumentDecision,
} from '@/components/vendor/vendor-document-dialog';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusDot } from '@/components/ui/status-dot';
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
import { useVendorDetail } from '@/hooks/use-vendor-detail';
import { useVendorProducts } from '@/hooks/use-vendor-products';
import type { VendorAction } from '@/lib/api/vendor-actions';
import type { VendorData, VendorRatingSummaryData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { formatCurrency, maskAccount } from '@/lib/utils';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

type BadgeIntent = NonNullable<BadgeProps['intent']>;

const STATUS_INTENTS: Record<string, BadgeIntent> = {
  [VENDOR_STATUSES.pending]: 'warning',
  [VENDOR_STATUSES.approved]: 'success',
  [VENDOR_STATUSES.rejected]: 'danger',
  [VENDOR_STATUSES.suspended]: 'danger',
  [VENDOR_STATUSES.inactive]: 'neutral',
};

const STATUS_LABELS: Record<string, string> = {
  [VENDOR_STATUSES.pending]: vendors.statuses.PENDING,
  [VENDOR_STATUSES.approved]: vendors.statuses.APPROVED,
  [VENDOR_STATUSES.rejected]: vendors.statuses.REJECTED,
  [VENDOR_STATUSES.suspended]: vendors.statuses.SUSPENDED,
  [VENDOR_STATUSES.inactive]: vendors.statuses.INACTIVE,
};

const SUCCESS_MESSAGES: Record<VendorAction, string> = {
  approve: vendors.approved,
  reject: vendors.rejected,
  suspend: vendors.suspended,
  reactivate: vendors.reactivated,
  commission: vendors.commissionUpdated,
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-fg-muted text-xs">{label}</span>
      <span className="text-fg text-sm font-medium break-words">{value}</span>
    </div>
  );
}

function DetailCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-fg-muted text-sm">{description}</p>}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </CardContent>
    </Card>
  );
}

function VendorBanner({ banner }: { banner: string }) {
  if (!banner) {
    return (
      <div className="border-border bg-surface-muted text-fg-muted flex h-24 items-center justify-center rounded-lg border border-dashed text-sm">
        {vendors.noBanner}
      </div>
    );
  }

  return (
    <Image
      src={banner}
      alt=""
      width={1200}
      height={200}
      unoptimized
      className="h-24 w-full rounded-lg object-cover"
    />
  );
}

function VendorRatingsCard({ ratings }: { ratings: VendorRatingSummaryData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{vendors.ratingsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-fg text-2xl font-semibold tabular-nums">
            {ratings.average.toFixed(1)}
          </span>
          <span className="text-fg-muted text-sm">{vendors.ratingsTotal(ratings.total)}</span>
        </div>
        {ratings.breakdownList.length === 0 ? (
          <p className="text-fg-muted mt-3 text-sm">{vendors.ratingsEmpty}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1">
            {ratings.breakdownList.map((row) => (
              <li key={row.star} className="text-fg-muted flex items-center gap-3 text-sm">
                <span className="w-10">{vendors.starLabel(row.star)}</span>
                <span className="text-fg tabular-nums">{row.count}</span>
                <span className="tabular-nums">{vendors.percentLabel(row.percent)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function VendorProductsCard({ vendorId, enabled }: { vendorId: string; enabled: boolean }) {
  const { data, isLoading, error, page, setPage } = useVendorProducts(vendorId, enabled);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{vendors.productsTitle}</CardTitle>
      </CardHeader>
      {!enabled ? (
        <div className="p-4">
          <EmptyState title={vendors.productsEmptyTitle} description={vendors.productsNotLiveBody} />
        </div>
      ) : isLoading ? (
        <div className="px-5 pb-5" role="status" aria-busy="true">
          <span className="sr-only">{MESSAGES.common.loading}</span>
          <Skeleton className="bg-border-strong h-10 w-full" />
        </div>
      ) : error ? (
        <div className="p-4">
          <ErrorState message={error} />
        </div>
      ) : data.itemList.length === 0 ? (
        <div className="p-4">
          <EmptyState title={vendors.productsEmptyTitle} description={vendors.productsEmptyBody} />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{vendors.columns.product}</TableHead>
              <TableHead className="hidden sm:table-cell">{vendors.columns.sku}</TableHead>
              <TableHead className="hidden lg:table-cell">{vendors.columns.category}</TableHead>
              <TableHead>{vendors.columns.price}</TableHead>
              <TableHead className="hidden sm:table-cell">{vendors.columns.stock}</TableHead>
              <TableHead>{vendors.columns.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.itemList.map((product) => (
              <TableRow key={product.productId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Thumbnail
                      src={product.imageList[0]}
                      alt={product.name}
                      fallback={<Package className="size-4" aria-hidden="true" />}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="block max-w-40 truncate font-medium sm:max-w-56 lg:max-w-none">
                        {product.name}
                      </span>
                      <span className="text-fg-muted block max-w-40 truncate text-xs sm:hidden">
                        {product.sku || vendors.dash}
                      </span>
                      {product.isFeatured && (
                        <span className="text-fg-muted text-xs">{vendors.featured}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{product.sku || vendors.dash}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {product.categoryData.name || vendors.dash}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatCurrency(product.price)}
                  {product.mrpPrice > product.price && (
                    <span className="text-fg-muted ml-2 text-xs line-through">
                      {formatCurrency(product.mrpPrice)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">{product.stock}</TableCell>
                <TableCell>
                  <span className="sm:hidden">
                    <StatusDot
                      intent={product.isActive ? 'success' : 'neutral'}
                      label={product.isActive ? vendors.active : vendors.inactive}
                    />
                  </span>
                  <span className="hidden sm:inline">
                    <Badge intent={product.isActive ? 'success' : 'neutral'}>
                      {product.isActive ? vendors.active : vendors.inactive}
                    </Badge>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination
        currentPage={data.currentPage || page}
        totalPage={data.totalPage}
        totalRecord={data.totalRecord}
        limit={data.limit || 10}
        onPageChange={setPage}
      />
    </Card>
  );
}

function VendorDocumentsCard({
  vendor,
  onDecision,
}: {
  vendor: VendorData;
  onDecision: (documentId: string, mode: DocumentDecision) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{vendors.kycTitle}</CardTitle>
      </CardHeader>
      {vendor.documentList.length === 0 ? (
        <div className="p-4">
          <EmptyState title={vendors.kycEmptyTitle} description={vendors.kycEmptyBody} />
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {vendor.documentList.map((document) => {
            const items: OptionsMenuItem[] = [
              {
                label: vendors.verify,
                onSelect: () => onDecision(document.documentId, 'verify'),
              },
              {
                label: vendors.reject,
                intent: 'danger',
                onSelect: () => onDecision(document.documentId, 'reject'),
              },
            ];

            return (
              <li
                key={document.documentId}
                className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg text-sm font-medium">
                    {document.docType || vendors.dash}
                  </span>
                  <span className="text-fg-muted text-xs">{document.number || vendors.dash}</span>
                  {document.remark && (
                    <span className="text-fg-muted text-xs">{document.remark}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge intent={document.isVerified ? 'success' : 'warning'}>
                    {document.isVerified ? vendors.documentsVerified : vendors.documentsPending}
                  </Badge>
                  {document.fileUrl && (
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fg-muted hover:text-fg inline-flex items-center gap-1 text-sm"
                    >
                      {vendors.openDocument}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  )}
                  <OptionsMenu label={vendors.documentActionsLabel} items={items} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function VendorDetails({ vendorId }: { vendorId: string }) {
  const {
    vendor,
    ratings,
    isLoading,
    error,
    actionError,
    isActioning,
    refresh,
    runAction,
    verifyDocument,
  } = useVendorDetail(vendorId);
  const [action, setAction] = useState<VendorAction | null>(null);
  const [documentDecision, setDocumentDecision] = useState<{
    documentId: string;
    mode: DocumentDecision;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-busy="true">
        <span className="sr-only">{MESSAGES.common.loading}</span>
        <Skeleton className="bg-border-strong h-10 w-64" />
        <Skeleton className="bg-border-strong h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  const shop = vendor.shopName || vendors.shopFallback;
  const actionItems: OptionsMenuItem[] = [];

  if (vendor.status === VENDOR_STATUSES.pending) {
    actionItems.push({
      label: vendors.approve,
      icon: Check,
      onSelect: () => setAction('approve'),
    });
    actionItems.push({
      label: vendors.reject,
      icon: X,
      intent: 'danger',
      onSelect: () => setAction('reject'),
    });
  }

  if (vendor.status === VENDOR_STATUSES.approved) {
    actionItems.push({
      label: vendors.commissionAction,
      icon: Percent,
      onSelect: () => setAction('commission'),
    });
    actionItems.push({
      label: vendors.suspend,
      icon: Ban,
      intent: 'danger',
      onSelect: () => setAction('suspend'),
    });
  }

  if (vendor.status === VENDOR_STATUSES.suspended) {
    actionItems.push({
      label: vendors.reactivate,
      icon: RotateCcw,
      onSelect: () => setAction('reactivate'),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={ROUTES.vendors}
        className="text-fg-muted hover:text-fg inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {vendors.backToList}
      </Link>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Thumbnail src={vendor.logo} alt={shop} className="size-12" />
        <PageHeader
          title={shop}
          description={vendor.slug ? `/${vendor.slug}` : undefined}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge intent={STATUS_INTENTS[vendor.status] ?? 'neutral'}>
                {STATUS_LABELS[vendor.status] ?? vendor.status}
              </Badge>
              {actionItems.length > 0 && (
                <OptionsMenu label={vendors.rowActionsLabel} items={actionItems} />
              )}
            </div>
          }
        />
      </div>

      <VendorBanner banner={vendor.banner} />

      {vendor.rejectedReason && (
        <div className="bg-danger-bg text-danger rounded-md px-3 py-2.5 text-sm">
          <span className="font-medium">{vendors.reasonLabel}: </span>
          {vendor.rejectedReason}
        </div>
      )}


      <VendorActionDialog
        open={action !== null}
        vendor={vendor}
        action={action ?? 'approve'}
        isSubmitting={isActioning}
        error={actionError}
        onClose={() => setAction(null)}
        onSubmit={(values) => {
          void runAction(action ?? 'approve', values).then((done) => {
            if (!done) return;
            showSuccess(SUCCESS_MESSAGES[action ?? 'approve']);
            setAction(null);
          });
        }}
      />

      <VendorDocumentDialog
        open={documentDecision !== null}
        shop={shop}
        decision={documentDecision?.mode ?? 'verify'}
        isSubmitting={isActioning}
        error={actionError}
        onClose={() => setDocumentDecision(null)}
        onSubmit={(remark) => {
          if (!documentDecision) return;
          void verifyDocument(documentDecision.documentId, documentDecision.mode === 'verify', remark || undefined).then((done) => {
            if (!done) return;
            showSuccess(
              documentDecision.mode === 'verify'
                ? vendors.documentVerified
                : vendors.documentRejected,
            );
            setDocumentDecision(null);
          });
        }}
      />


      <div className="grid gap-4 xl:grid-cols-2">
        <DetailCard title={vendors.shopDetailsTitle} description={vendor.description}>
          <DetailItem label={vendors.columns.slug} value={vendor.slug || vendors.dash} />
          <DetailItem label={vendors.columns.gstNumber} value={vendor.gstNumber || vendors.dash} />
          <DetailItem label={vendors.columns.panNumber} value={vendor.panNumber || vendors.dash} />
          <DetailItem
            label={vendors.columns.payoutCycle}
            value={`${vendor.payoutCycleDays} ${vendors.days}`}
          />
          <DetailItem label={vendors.columns.joined} value={formatRelativeTime(vendor.createdAt)} />
          <DetailItem label={vendors.columns.updated} value={formatRelativeTime(vendor.updatedAt)} />
          <DetailItem
            label={vendors.columns.approvedAt}
            value={vendor.approvedAt ? formatRelativeTime(vendor.approvedAt) : vendors.dash}
          />
          <DetailItem
            label={vendors.columns.vacation}
            value={vendor.isOnVacation ? vendors.onVacation : vendors.notOnVacation}
          />
          {vendor.isOnVacation && vendor.vacationMessage && (
            <DetailItem label={vendors.columns.vacationMessage} value={vendor.vacationMessage} />
          )}
          {vendor.isOnVacation && vendor.vacationUntil && (
            <DetailItem
              label={vendors.columns.vacationUntil}
              value={formatRelativeTime(vendor.vacationUntil)}
            />
          )}
        </DetailCard>

        <DetailCard title={vendors.ownerTitle}>
          <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-3">
            <Thumbnail src={vendor.userData.avatarUrl} alt={vendor.userData.name || vendors.dash} />
            <div className="flex flex-col gap-0.5">
              <span className="text-fg text-sm font-medium">
                {vendor.userData.name || vendors.dash}
              </span>
              <Badge
                intent={vendor.userData.isActive ? 'success' : 'neutral'}
                className="w-fit"
              >
                {vendor.userData.isActive ? vendors.accountActive : vendors.accountInactive}
              </Badge>
            </div>
          </div>
          <DetailItem label={vendors.columns.ownerEmail} value={vendor.userData.email || vendors.dash} />
          <DetailItem label={vendors.columns.ownerPhone} value={vendor.userData.phone || vendors.dash} />
        </DetailCard>

        <DetailCard title={vendors.performanceTitle}>
          <DetailItem label={vendors.columns.rating} value={vendors.rating(vendor.rating)} />
          <DetailItem label={vendors.columns.ratingCount} value={String(vendor.ratingCount)} />
          <DetailItem label={vendors.columns.totalSales} value={formatCurrency(vendor.totalSales)} />
          <DetailItem
            label={vendors.columns.pendingPayout}
            value={formatCurrency(vendor.pendingAmount)}
          />
          <DetailItem
            label={vendors.columns.commission}
            value={vendors.commission(vendor.commissionRate)}
          />
        </DetailCard>

        <DetailCard title={vendors.payoutTitle}>
          <DetailItem
            label={vendors.columns.bankHolder}
            value={vendor.bankData.bankHolderName || vendors.dash}
          />
          <DetailItem
            label={vendors.columns.bankAccount}
            value={maskAccount(vendor.bankData.bankAccountNo)}
          />
          <DetailItem label={vendors.columns.ifsc} value={vendor.bankData.bankIfsc || vendors.dash} />
          <DetailItem label={vendors.columns.upi} value={vendor.bankData.upiId || vendors.dash} />
        </DetailCard>
      </div>

      <VendorRatingsCard ratings={ratings} />

      <VendorDocumentsCard
        vendor={vendor}
        onDecision={(documentId, mode) => setDocumentDecision({ documentId, mode })}
      />

      <VendorProductsCard
        vendorId={vendorId}
        enabled={vendor.status === VENDOR_STATUSES.approved}
      />
    </div>
  );
}
