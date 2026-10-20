'use client';

import { ExternalLink, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusDot } from '@/components/ui/status-dot';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { ROUTES } from '@/constants';
import { useVendorDocuments, type DocumentFilter } from '@/hooks/use-vendor-documents';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import {
  VendorDocumentDialog,
  type DocumentDecision,
} from '@/components/vendor/vendor-document-dialog';

const { dashboard, vendors } = MESSAGES;

const FILTERS: readonly { value: DocumentFilter; label: string }[] = [
  { value: 'all', label: vendors.documentsFilterAll },
  { value: 'pending', label: vendors.documentsFilterPending },
  { value: 'verified', label: vendors.documentsFilterVerified },
];

const DOC_TYPES = ['GST', 'PAN', 'AADHAAR', 'BANK_PROOF', 'ADDRESS_PROOF', 'OTHER'] as const;

export function VendorDocuments() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    filter,
    docType,
    search,
    page,
    setFilter,
    setDocType,
    setSearch,
    setPage,
    refresh,
    verifyDocument,
  } = useVendorDocuments();
  const [decision, setDecision] = useState<{
    documentId: string;
    mode: DocumentDecision;
    shop: string;
  } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount =
    (filter === 'all' ? 0 : 1) + (docType === '' ? 0 : 1);

  const resetFilters = () => {
    setFilter('all');
    setDocType('');
  };

  const submitDecision = async (remark: string) => {
    if (!decision) return;
    const done = await verifyDocument(
      decision.documentId,
      decision.mode === 'verify',
      remark || undefined,
    );
    if (!done) return;
    showSuccess(
      decision.mode === 'verify' ? vendors.documentVerified : vendors.documentRejected,
    );
    setDecision(null);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="border-border flex items-center gap-2 border-b p-4">
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <Search
              className="text-fg-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={vendors.documentsSearchPlaceholder}
              aria-label={MESSAGES.common.search}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(true)}
            className="shrink-0"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {MESSAGES.common.filters}
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-fg flex size-5 items-center justify-center rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            onClick={() => void refresh()}
            className="shrink-0"
          >
            {!isLoading && <RefreshCw className="size-4" aria-hidden="true" />}
            {dashboard.refresh}
          </Button>
        </div>

        {isLoading ? (
          <div className="px-4 py-6" role="status" aria-busy="true">
            <span className="sr-only">{MESSAGES.common.loading}</span>
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState message={error} onRetry={() => void refresh()} />
          </div>
        ) : data.itemList.length === 0 ? (
          <div className="p-4">
            <EmptyState title={vendors.documentsEmptyTitle} description={vendors.documentsEmptyBody} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{vendors.columns.vendor}</TableHead>
                <TableHead className="hidden sm:table-cell">{vendors.columns.documentType}</TableHead>
                <TableHead className="hidden md:table-cell">{vendors.columns.documentNumber}</TableHead>
                <TableHead>{vendors.columns.documentStatus}</TableHead>
                <TableHead className="hidden lg:table-cell">{vendors.columns.uploaded}</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  {vendors.columns.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.itemList.map((document) => {
                const shop = document.vendorData.shopName || vendors.shopFallback;
                const items: OptionsMenuItem[] = [
                  {
                    label: vendors.verify,
                    onSelect: () =>
                      setDecision({ documentId: document.documentId, mode: 'verify', shop }),
                  },
                  {
                    label: vendors.reject,
                    intent: 'danger',
                    onSelect: () =>
                      setDecision({ documentId: document.documentId, mode: 'reject', shop }),
                  },
                ];

                return (
                  <Fragment key={document.documentId}>
                    <TableRow>
                      <TableCell>
                        {document.vendorData.vendorId ? (
                          <Link
                            href={ROUTES.vendorDetails(document.vendorData.vendorId)}
                            className="text-primary block max-w-40 truncate font-medium hover:underline sm:max-w-56 lg:max-w-none"
                          >
                            {document.vendorData.shopName || vendors.shopFallback}
                          </Link>
                        ) : (
                          <span className="block max-w-40 truncate font-medium sm:max-w-56 lg:max-w-none">
                            {document.vendorData.shopName || vendors.shopFallback}
                          </span>
                        )}
                        <span className="text-fg-muted block truncate text-xs">
                          {document.docType || vendors.dash}
                        </span>
                        {document.remark && (
                          <span className="text-fg-muted block truncate text-xs">
                            {document.remark}
                          </span>
                        )}
                        <div className="mt-1 sm:hidden">
                          <OptionsMenu label={vendors.documentActionsLabel} items={items} />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {document.docType || vendors.dash}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {document.number || vendors.dash}
                      </TableCell>
                      <TableCell>
                        <span className="sm:hidden">
                          <StatusDot
                            intent={document.isVerified ? 'success' : 'warning'}
                            label={document.isVerified ? vendors.documentsVerified : vendors.documentsPending}
                          />
                        </span>
                        <span className="hidden sm:inline">
                          <Badge intent={document.isVerified ? 'success' : 'warning'}>
                            {document.isVerified ? vendors.documentsVerified : vendors.documentsPending}
                          </Badge>
                        </span>
                      </TableCell>
                      <TableCell className="text-fg-muted hidden whitespace-nowrap lg:table-cell">
                        {formatRelativeTime(document.createdAt)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap items-center justify-end gap-2">
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
                          <OptionsMenu
                            label={vendors.documentActionsLabel}
                            items={items}
                            className="flex justify-end"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
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

      <VendorDocumentDialog
        open={decision !== null}
        shop={decision?.shop ?? vendors.shopFallback}
        decision={decision?.mode ?? 'verify'}
        isSubmitting={isActioning}
        error={actionError}
        onClose={() => setDecision(null)}
        onSubmit={(remark) => void submitDecision(remark)}
      />

      <FilterSheet
        open={filtersOpen}
        title={vendors.documentsFiltersTitle}
        onClose={() => setFiltersOpen(false)}
        onReset={resetFilters}
      >
        <FilterGroup label={vendors.columns.documentStatus}>
          {FILTERS.map((item) => (
            <FilterOption
              key={item.value}
              label={item.label}
              selected={filter === item.value}
              onSelect={() => setFilter(item.value)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label={vendors.columns.documentType}>
          <FilterOption
            label={vendors.documentsFilterAllTypes}
            selected={docType === ''}
            onSelect={() => setDocType('')}
          />
          {DOC_TYPES.map((type) => (
            <FilterOption
              key={type}
              label={vendors.documentTypes[type] ?? type}
              selected={docType === type}
              onSelect={() => setDocType(type)}
            />
          ))}
        </FilterGroup>
      </FilterSheet>
    </>
  );
}
