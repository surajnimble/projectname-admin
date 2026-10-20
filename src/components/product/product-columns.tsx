'use client';

import { Package, Tag, Trash2, Warehouse } from 'lucide-react';
import { DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity, DataTableMedia } from '@/components/common/data-table-media';
import { StatusBadge, productStatusMeta } from '@/components/common/status-badge';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { PRODUCT_STATUSES, ROUTES } from '@/constants';
import type { ProductSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const { products } = MESSAGES;

export type ProductRowAction = 'status' | 'stock' | 'delete' | 'approve' | 'reject' | 'submit';

export const productColumns = (
  vendorId?: string,
): readonly DataTableColumn<ProductSummaryData>[] => [
  {
    key: 'product',
    header: products.columns.product,
    cell: (product) => (
      <div className="flex items-center gap-3">
        <DataTableMedia
          sources={product.imageList}
          alt={product.name}
          fallback={<Package className="size-4" aria-hidden="true" />}
        />
        <DataTableIdentity
          title={product.name}
          meta={product.sku || products.dash}
          href={vendorId ? ROUTES.vendorProductDetails(vendorId, product.productId) : undefined}
        />
      </div>
    ),
  },
  {
    key: 'vendor',
    header: products.columns.vendor,
    hideBelow: 'xl',
    width: 'w-32',
    cell: (product) => (
      <span className="block truncate">{product.vendorData?.shopName || products.dash}</span>
    ),
  },
  {
    key: 'sku',
    header: products.columns.sku,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (product) => (
      <span className="block truncate">{product.sku || products.dash}</span>
    ),
  },
  {
    key: 'category',
    header: products.columns.category,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (product) => (
      <span className="block truncate">{product.categoryData.name || products.dash}</span>
    ),
  },
  {
    key: 'price',
    header: products.columns.price,
    hideBelow: 'lg',
    width: 'w-32',
    numeric: true,
    cell: (product) => (
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap sm:flex-row sm:items-center sm:gap-2">
        <span className="font-medium">{formatCurrency(product.price)}</span>
        {product.mrpPrice > product.price && (
          <span className="text-fg-muted text-xs line-through sm:text-sm">
            {formatCurrency(product.mrpPrice)}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'stock',
    header: products.columns.stock,
    hideBelow: 'xl',
    width: 'w-24',
    numeric: true,
    cell: (product) => <span className="block">{product.stock}</span>,
  },
  {
    key: 'status',
    header: products.columns.status,
    align: 'center',
    hideBelow: 'lg',
    width: 'w-28',
    cell: (product) => {
      const status = product.isActive ? PRODUCT_STATUSES.active : PRODUCT_STATUSES.inactive;
      return <StatusBadge meta={productStatusMeta(status)} />;
    },
  },
  {
    key: 'approvalStatus',
    header: products.columns.approvalStatus,
    align: 'center',
    hideBelow: 'lg',
    width: 'w-32',
    cell: (product) => <StatusBadge meta={productStatusMeta(product.approvalStatus)} />,
  },
];

interface ProductRowActionsProps {
  product: ProductSummaryData;
  onAction: (product: ProductSummaryData, action: ProductRowAction) => void;
}

export function ProductRowActions({ product, onAction }: ProductRowActionsProps) {
  const items: OptionsMenuItem[] = [
    {
      label: products.changeStatus,
      icon: Tag,
      onSelect: () => onAction(product, 'status'),
    },
    {
      label: products.updateStock,
      icon: Warehouse,
      onSelect: () => onAction(product, 'stock'),
    },
  ];

  if (product.approvalStatus === 'PENDING') {
    items.push(
      {
        label: products.approveProduct,
        icon: Tag,
        onSelect: () => onAction(product, 'approve'),
      },
      {
        label: products.rejectProduct,
        icon: Trash2,
        intent: 'danger',
        onSelect: () => onAction(product, 'reject'),
      },
    );
  }

  items.push({
    label: products.deleteProduct,
    icon: Trash2,
    intent: 'danger',
    onSelect: () => onAction(product, 'delete'),
  });

  return (
    <OptionsMenu
      label={products.rowActionsLabel}
      items={items}
      className="flex justify-end"
    />
  );
}
