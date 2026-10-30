'use client';

import { ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Select, SelectItem } from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity } from '@/components/common/data-table-media';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { ROUTES } from '@/constants';
import { useVendorDocuments, type DocumentFilter } from '@/hooks/use-vendor-documents';
import type { VendorKycDocumentData } from '@/lib/api/contract';
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

const documentColumns: readonly DataTableColumn<VendorKycDocumentData>[] = [
  {
    key: 'vendor',
    header: vendors.columns.vendor,
    cell: (document) => (
      <DataTableIdentity
        title={document.vendorData.shopName || vendors.shopFallback}
        meta={document.remark || document.docType || vendors.dash}
        href={
          document.vendorData.vendorId
            ? ROUTES.vendorDetails(document.vendorData.vendorId)
            : undefined
        }
      />
    ),
  },
  {
    key: 'documentType',
    header: vendors.columns.documentType,
    hideBelow: 'sm',
    cell: (document) => <span className="block truncate">{document.docType || vendors.dash}</span>,
  },
  {
    key: 'documentNumber',
    header: vendors.columns.documentNumber,
    hideBelow: 'md',
    cell: (document) => <span className="block truncate">{document.number || vendors.dash}</span>,
  },
  {
    key: 'documentStatus',
    header: vendors.columns.documentStatus,
    align: 'center',
    width: 'w-32',
    cell: (document) => (
      <Badge intent={document.isVerified ? 'success' : 'warning'}>
        {document.isVerified ? vendors.documentsVerified : vendors.documentsPending}
      </Badge>
    ),
  },
  {
    key: 'uploaded',
    header: vendors.columns.uploaded,
    hideBelow: 'lg',
    cell: (document) => (
      <span className="text-fg-muted block whitespace-nowrap">
        {formatRelativeTime(document.createdAt)}
      </span>
    ),
  },
];

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
  const [draft, setDraft] = useState<{ filter: DocumentFilter; docType: string }>({
    filter: 'all',
    docType: '',
  });
  const activeFilterCount = (filter === 'all' ? 0 : 1) + (docType === '' ? 0 : 1);

  const openFilters = () => {
    setDraft({ filter, docType });
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraft({ filter: 'all', docType: '' });
  };

  const applyDraft = () => {
    setFilter(draft.filter);
    setDocType(draft.docType);
    setFiltersOpen(false);
  };

  const submitDecision = async (remark: string) => {
    if (!decision) return;
    const done = await verifyDocument(
      decision.documentId,
      decision.mode === 'verify',
      remark || undefined,
    );
    if (!done) return;
    showSuccess(decision.mode === 'verify' ? vendors.documentVerified : vendors.documentRejected);
    setDecision(null);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <DataTable
          columns={documentColumns}
          rows={data.itemList}
          rowKey={(document) => document.documentId}
          toolbar={{
            search: {
              value: search,
              placeholder: vendors.documentsSearchPlaceholder,
              onChange: setSearch,
            },
            filters: {
              label: MESSAGES.common.filters,
              count: activeFilterCount,
              onOpen: openFilters,
            },
            actions: (
              <Button
                variant="outline"
                size="sm"
                loading={isLoading}
                onClick={() => void refresh()}
                className="shrink-0"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {dashboard.refresh}
              </Button>
            ),
          }}
          actions={{
            header: vendors.columns.actions,
            render: (document) => {
              const items: OptionsMenuItem[] = [
                {
                  label: vendors.verify,
                  onSelect: () =>
                    setDecision({
                      documentId: document.documentId,
                      mode: 'verify',
                      shop: document.vendorData.shopName || vendors.shopFallback,
                    }),
                },
                {
                  label: vendors.reject,
                  intent: 'danger',
                  onSelect: () =>
                    setDecision({
                      documentId: document.documentId,
                      mode: 'reject',
                      shop: document.vendorData.shopName || vendors.shopFallback,
                    }),
                },
              ];

              return (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {document.fileUrl && (
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fg-muted data-hover-color inline-flex items-center gap-1 text-sm"
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
              );
            },
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={vendors.documentsEmptyTitle}
          emptyDescription={vendors.documentsEmptyBody}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || 10}
              onPageChange={setPage}
            />
          }
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
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={vendors.columns.documentStatus}>
          {FILTERS.map((item) => (
            <FilterOption
              key={item.value}
              label={item.label}
              selected={draft.filter === item.value}
              onSelect={() => setDraft((current) => ({ ...current, filter: item.value }))}
            />
          ))}
        </FilterGroup>
        <FilterGroup label={vendors.columns.documentType}>
          <Select
            value={draft.docType}
            onValueChange={(value) => setDraft((current) => ({ ...current, docType: value }))}
            aria-label={vendors.columns.documentType}
          >
            <SelectItem value="">{vendors.documentsFilterAllTypes}</SelectItem>
            {DOC_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {vendors.documentTypes[type] ?? type}
              </SelectItem>
            ))}
          </Select>
        </FilterGroup>
      </FilterSheet>
    </>
  );
}
