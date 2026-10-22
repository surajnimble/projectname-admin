'use client';

import { ArrowLeft, Package, Tag, Trash2, Warehouse } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { ProductActionDialog, type ProductDialogAction } from '@/components/product/product-action-dialog';
import { Badge } from '@/components/ui/badge';
import { DetailItem, PendingItem } from '@/components/common/detail-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusDot } from '@/components/ui/status-dot';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PRODUCT_STATUSES, type ProductStatus } from '@/constants';
import { useProductDetail } from '@/hooks/use-product-detail';
import { toProductSummary } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { products } = MESSAGES;

const STATUS_LABELS: Record<ProductStatus, string> = {
  [PRODUCT_STATUSES.draft]: products.statuses.DRAFT,
  [PRODUCT_STATUSES.active]: products.statuses.ACTIVE,
  [PRODUCT_STATUSES.inactive]: products.statuses.INACTIVE,
  [PRODUCT_STATUSES.archived]: products.statuses.ARCHIVED,
};

const STATUS_INTENTS: Record<string, 'success' | 'warning' | 'neutral' | 'danger'> = {
  [PRODUCT_STATUSES.active]: 'success',
  [PRODUCT_STATUSES.draft]: 'warning',
  [PRODUCT_STATUSES.inactive]: 'neutral',
  [PRODUCT_STATUSES.archived]: 'danger',
};

export function ProductDetails({
  vendorId,
  productId,
}: {
  vendorId: string;
  productId: string;
}) {
  const { product, isLoading, isPending, error, actionError, isActioning, runAction } =
    useProductDetail(productId, true);
  const [dialog, setDialog] = useState<ProductDialogAction | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-busy="true">
        <span className="sr-only">{MESSAGES.common.loading}</span>

        <Skeleton className="h-9 w-36" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-56 max-w-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!product.productId) {
    return <EmptyState title={products.detailUnavailable} description={products.emptyBody} />;
  }

  const status = (product.status || PRODUCT_STATUSES.inactive) as ProductStatus;
  const menuItems: OptionsMenuItem[] = [
    {
      label: products.changeStatus,
      icon: Tag,
      onSelect: () => setDialog('status'),
    },
    {
      label: products.updateStock,
      icon: Warehouse,
      onSelect: () => setDialog('stock'),
    },
    {
      label: products.deleteProduct,
      icon: Trash2,
      intent: 'danger',
      onSelect: () => setDialog('delete'),
    },
  ];

  const handleSubmit = async (values: { status?: ProductStatus; stock?: number }) => {
    if (!dialog) return;
    const done = await runAction(dialog, values);
    if (!done) return;
    showSuccess(
      dialog === 'status'
        ? products.statusUpdated
        : dialog === 'stock'
          ? products.stockUpdated
          : products.productDeleted,
    );
    setDialog(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/vendors/${vendorId}`}
        className="border-border bg-surface-muted/50 text-fg-muted hover:text-fg hover:bg-hover inline-flex w-fit items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {products.backToProducts}
      </Link>

      <PageHeader
        title={product.name}
        description={product.sku ? `SKU ${product.sku}` : undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge intent={STATUS_INTENTS[status] ?? 'neutral'}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
            {product.isFeatured && (
              <Badge intent="primary">{products.featured}</Badge>
            )}
            <OptionsMenu label={products.rowActionsLabel} items={menuItems} />
          </div>
        }
      />

      {product.imageList.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {product.imageList.map((image) => (
            <Image
              key={image}
              src={image}
              alt={product.name}
              width={320}
              height={320}
              unoptimized
              className="border-border aspect-square w-full rounded-lg border object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="border-border bg-surface-muted/60 text-fg-muted flex aspect-[4/1] items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <span className="bg-surface-muted/60 text-primary flex size-12 items-center justify-center rounded-lg border border-border">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm">{products.noImages}</span>
          </div>
        </div>
      )}

      {product.description ? (
        <Card>
          <CardHeader>
            <CardTitle>{products.descriptionTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fg-muted text-sm break-words">{product.description}</p>
          </CardContent>
        </Card>
      ) : isPending ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{products.detailsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <DetailItem label={products.columns.price} value={formatCurrency(product.price)} />
          <DetailItem label={products.columns.mrp} value={formatCurrency(product.mrpPrice)} />
          {isPending ? (
            <>
              <PendingItem label={products.columns.tax} />
              <PendingItem label={products.columns.lowStock} />
            </>
          ) : (
            <>
              <DetailItem label={products.columns.tax} value={`${product.taxPercent}%`} />
              <DetailItem
                label={products.columns.lowStock}
                value={String(product.lowStockThreshold)}
              />
            </>
          )}
          <DetailItem label={products.columns.stock} value={String(product.stock)} />
          <DetailItem label={products.columns.sold} value={String(product.soldCount)} />
          {isPending ? (
            <>
              <PendingItem label={products.columns.views} />
              <PendingItem label={products.columns.brand} />
              <PendingItem label={products.columns.warranty} />
              <PendingItem label={products.columns.condition} />
            </>
          ) : (
            <>
              <DetailItem label={products.columns.views} value={String(product.viewCount)} />
              <DetailItem label={products.columns.brand} value={product.brandData.name || '—'} />
              <DetailItem
                label={products.columns.warranty}
                value={
                  product.warrantySummary || `${product.warrantyMonths} ${products.months}`
                }
              />
              <DetailItem label={products.columns.condition} value={product.condition || '—'} />
            </>
          )}
          <DetailItem label={products.columns.rating} value={product.rating.toFixed(1)} />
          <DetailItem label={products.columns.category} value={product.categoryData.name || '—'} />
        </CardContent>
      </Card>

      {product.tagList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{products.tagsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {product.tagList.map((tag) => (
              <Badge key={tag.tagId} intent="neutral">
                {tag.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {isPending && (
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <PendingItem key={index} label={products.attributesTitle} />
            ))}
          </CardContent>
        </Card>
      )}

      {product.attributeList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{products.attributesTitle}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.attributeList.map((attribute) => (
              <DetailItem
                key={attribute.attributeId}
                label={attribute.name}
                value={attribute.value}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {product.variantList.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{products.variantsTitle}</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{products.columns.variant}</TableHead>
                <TableHead className="hidden sm:table-cell">{products.columns.sku}</TableHead>
                <TableHead>{products.columns.price}</TableHead>
                <TableHead className="hidden sm:table-cell">{products.columns.stock}</TableHead>
                <TableHead>{products.columns.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variantList.map((variant) => (
                <TableRow key={variant.variantId}>
                  <TableCell className="font-medium">
                    {variant.title || variant.sku || products.dash}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {variant.sku || products.dash}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(variant.price)}</TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">{variant.stock}</TableCell>
                  <TableCell>
                    <StatusDot
                      intent={variant.isActive ? 'success' : 'neutral'}
                      label={variant.isActive ? products.statuses.ACTIVE : products.statuses.INACTIVE}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {product.reviewList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{products.reviewsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {product.reviewList.map((review) => (
              <div key={review.reviewId} className="border-border flex flex-col gap-1 border-b pb-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-fg text-sm font-medium">
                    {review.userData.name || products.anonymousReviewer}
                  </span>
                  <span className="text-fg-muted text-xs">
                    {review.rating.toFixed(1)}★ · {formatRelativeTime(review.createdAt)}
                  </span>
                </div>
                {review.title && <span className="text-fg text-sm">{review.title}</span>}
                {review.comment && (
                  <span className="text-fg-muted text-sm break-words">{review.comment}</span>
                )}
                {review.vendorReply && (
                  <span className="text-fg-muted text-xs break-words">
                    {products.vendorReply}: {review.vendorReply}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ProductActionDialog
        open={dialog !== null}
        product={toProductSummary(product)}
        action={dialog ?? 'status'}
        isSubmitting={isActioning}
        error={actionError}
        onClose={() => setDialog(null)}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
}
