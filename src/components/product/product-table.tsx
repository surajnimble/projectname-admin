'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Tag, Trash2, Warehouse } from 'lucide-react';
import { StatusBadge, productStatusMeta } from '@/components/common/status-badge';
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
import { PRODUCT_STATUSES, ROUTES } from '@/constants';
import type { ProductSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const { products } = MESSAGES;

export type ProductRowAction = 'status' | 'stock' | 'delete';

interface ProductTableProps {
  products: ProductSummaryData[];
  vendorId: string;
  onAction: (product: ProductSummaryData, action: ProductRowAction) => void;
}

export function ProductTable({ products: items, vendorId, onAction }: ProductTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{products.columns.product}</TableHead>
          <TableHead className="hidden sm:table-cell">{products.columns.sku}</TableHead>
          <TableHead className="hidden lg:table-cell">{products.columns.category}</TableHead>
          <TableHead>{products.columns.price}</TableHead>
          <TableHead className="hidden sm:table-cell">{products.columns.stock}</TableHead>
          <TableHead className="w-32 text-center">{products.columns.status}</TableHead>
          <TableHead className="text-right">{products.columns.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((product) => {
          const status = product.isActive ? PRODUCT_STATUSES.active : PRODUCT_STATUSES.inactive;
          const detailPath = ROUTES.vendorProductDetails(vendorId, product.productId);
          const menuItems: OptionsMenuItem[] = [
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
            {
              label: products.deleteProduct,
              icon: Trash2,
              intent: 'danger',
              onSelect: () => onAction(product, 'delete'),
            },
          ];

          return (
            <TableRow
              key={product.productId}
              className="transition-colors"
              data-ripple=""
              data-hover-color
              onClick={() => router.push(detailPath)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Thumbnail
                    src={product.imageList[0]}
                    alt={product.name}
                    fallback={<Package className="size-4" aria-hidden="true" />}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      href={detailPath}
                      onClick={(event) => event.stopPropagation()}
                      className="text-primary block max-w-32 truncate font-medium hover:underline sm:max-w-56 lg:max-w-none"
                    >
                      {product.name}
                    </Link>
                    <span className="text-fg-muted block max-w-32 truncate text-xs sm:hidden">
                      {product.sku || products.dash}
                    </span>
                    {product.isFeatured && (
                      <span className="text-fg-muted text-xs">{products.featured}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{product.sku || products.dash}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {product.categoryData.name || products.dash}
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-0.5 tabular-nums sm:flex-row sm:items-center sm:gap-2">
                  <span className="font-medium">{formatCurrency(product.price)}</span>
                  {product.mrpPrice > product.price && (
                    <span className="text-fg-muted text-xs line-through sm:text-sm">
                      {formatCurrency(product.mrpPrice)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden tabular-nums sm:table-cell">{product.stock}</TableCell>
              <TableCell className="w-32 text-center">
                <StatusBadge meta={productStatusMeta(status)} />
              </TableCell>
              <TableCell className="relative z-10" onClick={(event) => event.stopPropagation()}>
                <OptionsMenu
                  label={products.rowActionsLabel}
                  items={menuItems}
                  className="flex justify-end"
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
