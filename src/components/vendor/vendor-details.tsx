'use client';

import { ArrowLeft, Ban, Check, ExternalLink, Percent, RefreshCw, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { VendorActionDialog } from '@/components/vendor/vendor-action-dialog';
import {
  VendorDocumentDialog,
  type DocumentDecision,
} from '@/components/vendor/vendor-document-dialog';
import { Badge } from '@/components/ui/badge';
import { DetailCard, DetailItem, PendingItem } from '@/components/common/detail-grid';
import { vendorStatusMeta } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Thumbnail } from '@/components/ui/thumbnail';
import { ProductList } from '@/components/product/product-list';
import { VendorPayouts } from '@/components/vendor/vendor-payouts';
import { VendorReturns } from '@/components/vendor/vendor-returns';
import { ROUTES, VENDOR_STATUSES } from '@/constants';
import { useVendorDetail } from '@/hooks/use-vendor-detail';
import type { VendorAction } from '@/lib/api/vendor-actions';
import type { VendorData, VendorRatingSummaryData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { formatCurrency, maskAccount } from '@/lib/utils';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

const SUCCESS_MESSAGES: Record<VendorAction, string> = {
  approve: vendors.approved,
  reject: vendors.rejected,
  suspend: vendors.suspended,
  reactivate: vendors.reactivated,
  commission: vendors.commissionUpdated,
};

function VendorBanner({ banner }: { banner: string }) {
  if (!banner) {
    return (
      <div className="border-border bg-surface-muted/60 text-fg-muted flex h-28 items-center justify-center rounded-lg border border-dashed text-sm sm:h-40 lg:h-52">
        {vendors.noBanner}
      </div>
    );
  }

  return (
    <Image
      src={banner}
      alt=""
      width={1200}
      height={320}
      unoptimized
      className="h-28 w-full rounded-lg object-cover sm:h-40 lg:h-52"
    />
  );
}

function VendorRatingsCard({
  ratings,
  isLoading,
}: {
  ratings: VendorRatingSummaryData;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{vendors.ratingsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-3" role="status" aria-busy="true">
            <span className="sr-only">{MESSAGES.common.loading}</span>
            <Skeleton className="h-8 w-24" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-full" />
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

function VendorDocumentsCard({
  vendor,
  isPending,
  onDecision,
}: {
  vendor: VendorData;
  isPending: boolean;
  onDecision: (documentId: string, mode: DocumentDecision) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{vendors.kycTitle}</CardTitle>
      </CardHeader>
      {isPending ? (
        <div className="flex flex-col gap-3 p-5" role="status" aria-busy="true">
          <span className="sr-only">{MESSAGES.common.loading}</span>
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : vendor.documentList.length === 0 ? (
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
    isPending,
    isRatingsLoading,
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
        <Skeleton className="h-9 w-36" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-28 w-full rounded-lg sm:h-40 lg:h-52" />
        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={ROUTES.vendors}
          replace
          className="border-border bg-surface-muted/50 text-fg-muted hover:text-fg hover:bg-surface-muted inline-flex w-fit items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {vendors.backToList}
        </Link>
        <Button
          variant="outline"
          size="sm"
          loading={isPending}
          onClick={() => void refresh()}
        >
          {!isPending && <RefreshCw className="size-4" aria-hidden="true" />}
          {MESSAGES.dashboard.refresh}
        </Button>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Thumbnail src={vendor.logo} alt={shop} className="size-12" />
        <PageHeader
          title={shop}
          description={vendor.slug ? `/${vendor.slug}` : undefined}
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge intent={vendorStatusMeta(vendor.status).intent}>
                {vendorStatusMeta(vendor.status).label}
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
          {isPending ? (
            <>
              <PendingItem label={vendors.columns.gstNumber} />
              <PendingItem label={vendors.columns.panNumber} />
              <PendingItem label={vendors.columns.payoutCycle} />
            </>
          ) : (
            <>
              <DetailItem label={vendors.columns.gstNumber} value={vendor.gstNumber || vendors.dash} />
              <DetailItem label={vendors.columns.panNumber} value={vendor.panNumber || vendors.dash} />
              <DetailItem
                label={vendors.columns.payoutCycle}
                value={`${vendor.payoutCycleDays} ${vendors.days}`}
              />
            </>
          )}
          <DetailItem label={vendors.columns.joined} value={formatRelativeTime(vendor.createdAt)} />
          {isPending ? (
            <PendingItem label={vendors.columns.updated} />
          ) : (
            <DetailItem label={vendors.columns.updated} value={formatRelativeTime(vendor.updatedAt)} />
          )}
          {isPending ? (
            <PendingItem label={vendors.columns.approvedAt} />
          ) : (
            <DetailItem
              label={vendors.columns.approvedAt}
              value={vendor.approvedAt ? formatRelativeTime(vendor.approvedAt) : vendors.dash}
            />
          )}
          {isPending ? (
            <PendingItem label={vendors.columns.vacation} />
          ) : (
            <>
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
            </>
          )}
        </DetailCard>

        <DetailCard title={vendors.ownerTitle}>
          <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-3">
            {isPending ? (
              <Skeleton className="size-10 rounded-lg" />
            ) : (
              <Avatar>
                <AvatarImage src={vendor.userData.avatarUrl} alt={vendor.userData.name} />
              </Avatar>
            )}
            <div className="flex flex-col gap-0.5">
              {isPending ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <span className="text-fg text-sm font-medium">
                  {vendor.userData.name || vendors.dash}
                </span>
              )}
              {!isPending && (
                <Badge
                  intent={vendor.userData.isActive ? 'success' : 'neutral'}
                  className="w-fit"
                >
                  {vendor.userData.isActive ? vendors.accountActive : vendors.accountInactive}
                </Badge>
              )}
            </div>
          </div>
          <DetailItem label={vendors.columns.ownerEmail} value={vendor.userData.email || vendors.dash} />
          {isPending ? (
            <PendingItem label={vendors.columns.ownerPhone} />
          ) : (
            <DetailItem label={vendors.columns.ownerPhone} value={vendor.userData.phone || vendors.dash} />
          )}
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

        {isPending ? (
          <Card>
            <CardHeader>
              <CardTitle>{vendors.payoutTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2, 3].map((index) => (
                <PendingItem key={index} label={vendors.payoutTitle} />
              ))}
            </CardContent>
          </Card>
        ) : (
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
        )}
      </div>

      <VendorRatingsCard ratings={ratings} isLoading={isRatingsLoading} />

      <VendorDocumentsCard
        vendor={vendor}
        isPending={isPending}
        onDecision={(documentId, mode) => setDocumentDecision({ documentId, mode })}
      />

      <VendorPayouts vendorId={vendorId} />

      <VendorReturns vendorId={vendorId} />

      <ProductList vendorId={vendorId} />
    </div>
  );
}