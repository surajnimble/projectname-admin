'use client';

import { Search, SlidersHorizontal, X, type LucideIcon } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TABLE_DESKTOP_MEDIA_QUERY } from '@/constants';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/messages';

/** Breakpoint a column disappears below. Header and cells always hide together. */
export type DataTableBreakpoint = 'lg' | 'xl' | '2xl';

export type DataTableAlign = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  /** Stable key, also used as the React key. */
  key: string;
  header: string;
  align?: DataTableAlign;
  /** Hidden below this breakpoint. */
  hideBelow?: DataTableBreakpoint;
  /** Fixed column width, e.g. 'w-32'. Columns without one share the leftover space. */
  width?: string;
  /** Renders numbers with tabular figures. */
  numeric?: boolean;
  cell: (row: T) => ReactNode;
}

/** An action that runs against every selected record. */
export interface DataTableBulkAction<T> {
  label: string;
  icon?: LucideIcon;
  intent?: 'default' | 'danger';
  /** Hides the action when it does not apply to the current selection. */
  isVisible?: (rows: readonly T[]) => boolean;
  onSelect: (rows: T[]) => void;
}

/** Row selection state, owned by the page so it can drive bulk actions. */
export interface DataTableSelection<T> {
  selected: readonly T[];
  onChange: (selected: T[]) => void;
  /** Actions offered for the current selection. */
  actions?: readonly DataTableBulkAction<T>[];
  /** Rows that cannot be selected. */
  isSelectable?: (row: T) => boolean;
}

export interface DataTableSearch {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export interface DataTableSelect {
  value: string;
  ariaLabel: string;
  /** Shown while no option is picked. */
  placeholder?: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

export interface DataTableFilters {
  label: string;
  count?: number;
  onOpen: () => void;
}

export interface DataTableToolbar {
  /** Heading shown on the left of the toolbar. */
  title?: string;
  search?: DataTableSearch;
  select?: DataTableSelect;
  filters?: DataTableFilters;
  /** Buttons rendered on the right (refresh, create, ...). */
  actions?: ReactNode;
}

export interface DataTableActions<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  toolbar?: DataTableToolbar;
  /** Kebab menu column. Omit it and no actions column is rendered. */
  actions?: DataTableActions<T>;
  onRowClick?: (row: T) => void;
  /** Enables row checkboxes and the bulk action bar. */
  selection?: DataTableSelection<T>;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonRows?: number;
  /** Rendered under the table, e.g. pagination. */
  footer?: ReactNode;
}

const VISIBILITY: Record<DataTableBreakpoint, string> = {
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
  '2xl': 'hidden 2xl:table-cell',
};

const ALIGNMENT: Record<DataTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const SELECT_COLUMN_WIDTH = 'w-12';
const ACTIONS_COLUMN_WIDTH = 'w-24';

function columnClass<T>(column: DataTableColumn<T>) {
  return [
    column.hideBelow ? VISIBILITY[column.hideBelow] : '',
    column.align ? ALIGNMENT[column.align] : '',
    column.width ?? '',
    column.numeric ? 'tabular-nums' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function headerClass<T>(column: DataTableColumn<T>) {
  return ['px-4', columnClass(column)].filter(Boolean).join(' ');
}

function DataTableToolbarBar({ toolbar }: { toolbar: DataTableToolbar }) {
  const { title, search, select, filters, actions } = toolbar;

  return (
    <div className="border-border bg-surface flex flex-wrap items-center gap-2 border-b px-4 py-3">
      {title && <h2 className="text-fg text-base font-semibold">{title}</h2>}
      {search && (
        <div className="relative min-w-0 flex-1 basis-56 sm:max-w-72">
          <Search
            className="text-fg-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
            aria-label={MESSAGES.common.search}
            className="pl-9"
          />
        </div>
      )}
      {filters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={filters.onOpen}
          className="shrink-0"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {filters.label}
          {filters.count !== undefined && filters.count > 0 && (
            <span className="bg-primary text-primary-fg flex size-5 items-center justify-center rounded-full text-xs">
              {filters.count}
            </span>
          )}
        </Button>
      )}
      {select && (
        <Select value={select.value} onValueChange={(value) => select.onChange(value)}>
          <SelectTrigger aria-label={select.ariaLabel} className="w-full shrink-0 sm:w-40">
            <SelectValue placeholder={select.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {select.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">{actions}</div>
      )}
    </div>
  );
}

function DataTableBulkBar<T>({
  selection,
  onClear,
}: {
  selection: DataTableSelection<T>;
  onClear: () => void;
}) {
  const selected = selection.selected;
  const actions = (selection.actions ?? []).filter(
    (action) => !action.isVisible || action.isVisible(selected),
  );

  return (
    <div className="border-border bg-primary-soft/60 flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
      <span className="text-fg text-sm font-medium">
        {MESSAGES.common.selectedCount(selected.length)}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={action.intent === 'danger' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => action.onSelect([...selected])}
          >
            {action.icon && <action.icon className="size-4" aria-hidden="true" />}
            {action.label}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="text-fg-muted ml-auto"
      >
        <X className="size-4" aria-hidden="true" />
        {MESSAGES.common.clearSelection}
      </Button>
    </div>
  );
}

function DataTableSkeleton<T>({
  columns,
  actions,
  selectable,
  rows,
}: {
  columns: readonly DataTableColumn<T>[];
  actions?: DataTableActions<T>;
  selectable: boolean;
  rows: number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className={cn(SELECT_COLUMN_WIDTH, 'px-4')} scope="col">
              <Skeleton className="size-5" />
            </TableHead>
          )}
          {columns.map((column) => (
            <TableHead key={column.key} className={headerClass(column)} scope="col">
              <Skeleton className="h-3.5 w-20" />
            </TableHead>
          ))}
          {actions && (
            <TableHead className={cn(ACTIONS_COLUMN_WIDTH, 'px-4 text-right')} scope="col">
              <span className="sr-only">{actions.header}</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            {selectable && (
              <TableCell className={cn(SELECT_COLUMN_WIDTH, 'px-4')}>
                <Skeleton className="size-5" />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column.key} className={columnClass(column)}>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            ))}
            {actions && (
              <TableCell className={cn(ACTIONS_COLUMN_WIDTH, 'text-right')}>
                <Skeleton className="size-6" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DataTableCardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="divide-border divide-y">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Below the `lg` breakpoint a row becomes a stacked card, so no screen needs to
 * scroll sideways. The same column list drives both layouts.
 */
function DataTableCards<T>({
  columns,
  rows,
  rowKey,
  actions,
  selection,
  selectedKeys,
  onToggleRow,
  onRowClick,
}: {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  actions?: DataTableActions<T>;
  selection?: DataTableSelection<T>;
  selectedKeys: Set<string>;
  onToggleRow: (row: T) => void;
  onRowClick?: (row: T) => void;
}) {
  const [primary, ...details] = columns;

  return (
    <div className="divide-border divide-y">
      {rows.map((row) => {
        const key = rowKey(row);
        const isSelected = selectedKeys.has(key);
        const isSelectable = !selection?.isSelectable || selection.isSelectable(row);

        return (
          <div
            key={key}
            data-state={isSelected ? 'selected' : undefined}
            className={cn(
              'flex flex-col gap-3 px-4 py-4 transition-colors',
              isSelected && 'bg-primary-soft/60',
              onRowClick && 'cursor-pointer',
            )}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            <div className="flex items-start gap-3">
              {selection && (
                <Checkbox
                  checked={isSelected}
                  disabled={!isSelectable}
                  onCheckedChange={() => onToggleRow(row)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={MESSAGES.common.selectRow}
                  className="mt-0.5 size-5"
                />
              )}
              <div className="min-w-0 flex-1">{primary?.cell(row)}</div>
              {actions && (
                <div
                  className="relative z-10 shrink-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  {actions.render(row)}
                </div>
              )}
            </div>
            {details.length > 0 && (
              <dl className="flex flex-col gap-2">
                {details.map((column) => (
                  <div key={column.key} className="flex items-baseline gap-3">
                    <dt className="text-fg-muted w-24 shrink-0 text-xs">{column.header}</dt>
                    <dd className="min-w-0 flex-1 text-sm break-words [&_.truncate]:whitespace-normal">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  toolbar,
  actions,
  onRowClick,
  selection,
  isLoading = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  skeletonRows = 5,
  footer,
}: DataTableProps<T>) {
  const isDesktop = useMediaQuery(TABLE_DESKTOP_MEDIA_QUERY);
  const selectedRows = selection?.selected ?? [];
  const selectedKeys = new Set(selectedRows.map(rowKey));
  const selectableRows = selection
    ? rows.filter((row) => !selection.isSelectable || selection.isSelectable(row))
    : [];
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((row) => selectedKeys.has(rowKey(row)));
  const someSelected =
    !allSelected && selectableRows.some((row) => selectedKeys.has(rowKey(row)));

  useEffect(() => {
    if (!selection) return;
    const visible = new Set(rows.map(rowKey));
    const kept = selection.selected.filter((row) => visible.has(rowKey(row)));
    if (kept.length !== selection.selected.length) {
      selection.onChange(kept);
    }
  }, [rows, rowKey, selection]);

  const toggleRow = (row: T) => {
    if (!selection) return;
    const key = rowKey(row);
    const next = selectedKeys.has(key)
      ? selection.selected.filter((item) => rowKey(item) !== key)
      : [...selection.selected, row];
    selection.onChange(next);
  };

  const toggleAll = () => {
    if (!selection) return;
    selection.onChange(allSelected ? [] : [...selectableRows]);
  };

  const clearSelection = () => {
    selection?.onChange([]);
  };

  const renderSelectionCell = (row: T) => {
    if (!selection) return null;
    const key = rowKey(row);
    const isSelectable = !selection.isSelectable || selection.isSelectable(row);

    return (
      <TableCell className={cn(SELECT_COLUMN_WIDTH, 'px-4')}>
        <Checkbox
          checked={selectedKeys.has(key)}
          disabled={!isSelectable}
          onCheckedChange={() => toggleRow(row)}
          onClick={(event) => event.stopPropagation()}
          aria-label={MESSAGES.common.selectRow}
          className="size-5"
        />
      </TableCell>
    );
  };

  const body = () => {
    if (isLoading) {
      return isDesktop ? (
        <DataTableSkeleton
          columns={columns}
          actions={actions}
          selectable={Boolean(selection)}
          rows={skeletonRows}
        />
      ) : (
        <DataTableCardSkeleton rows={skeletonRows} />
      );
    }

    if (error) {
      return (
        <div className="p-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      );
    }

    if (!rows || rows.length === 0) {
      return (
        <div className="p-4">
          <EmptyState title={emptyTitle ?? ''} description={emptyDescription} />
        </div>
      );
    }

    if (!isDesktop) {
      return (
        <DataTableCards
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          actions={actions}
          selection={selection}
          selectedKeys={selectedKeys}
          onToggleRow={toggleRow}
          onRowClick={onRowClick}
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead className={cn(SELECT_COLUMN_WIDTH, 'px-4')} scope="col">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={toggleAll}
                  aria-label={MESSAGES.common.selectAll}
                  className="size-5"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.key} scope="col" className={headerClass(column)}>
                {column.header}
              </TableHead>
            ))}
            {actions && (
              <TableHead scope="col" className={cn(ACTIONS_COLUMN_WIDTH, 'px-4 text-right')}>
                {actions.header}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const key = rowKey(row);
            const isSelected = selectedKeys.has(key);

            return (
              <TableRow
                key={key}
                data-state={isSelected ? 'selected' : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
                data-ripple={onRowClick ? '' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {renderSelectionCell(row)}
                {columns.map((column) => (
                  <TableCell key={column.key} className={columnClass(column)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    className={cn(ACTIONS_COLUMN_WIDTH, 'relative z-10 text-right')}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {actions.render(row)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      {toolbar && <DataTableToolbarBar toolbar={toolbar} />}
      {selection && selectedRows.length > 0 && (
        <DataTableBulkBar selection={selection} onClear={clearSelection} />
      )}
      {body()}
      {footer}
    </>
  );
}
