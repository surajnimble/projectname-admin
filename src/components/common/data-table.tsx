'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
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
import { MESSAGES } from '@/messages';

/** Breakpoint a column disappears below. Header and cells always hide together. */
export type DataTableBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

export type DataTableAlign = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  /** Stable key, also used as the React key. */
  key: string;
  header: string;
  align?: DataTableAlign;
  /** Hidden below this breakpoint. */
  hideBelow?: DataTableBreakpoint;
  /** Fixed column width, e.g. 'w-32'. */
  width?: string;
  /** Renders numbers with tabular figures. */
  numeric?: boolean;
  cell: (row: T) => ReactNode;
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
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

const ALIGNMENT: Record<DataTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

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
  return ['px-3', columnClass(column)].filter(Boolean).join(' ');
}

function DataTableToolbarBar({ toolbar }: { toolbar: DataTableToolbar }) {
  const { title, search, select, filters, actions } = toolbar;

  return (
    <div className="border-border flex flex-wrap items-center gap-2 border-b p-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {title && <h2 className="text-fg text-base font-semibold">{title}</h2>}
        {search && (
          <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
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
            <SelectTrigger aria-label={select.ariaLabel} className="w-full sm:w-44">
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
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function DataTableSkeleton<T>({
  columns,
  actions,
  rows,
}: {
  columns: readonly DataTableColumn<T>[];
  actions?: DataTableActions<T>;
  rows: number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={headerClass(column)}>
              {column.header}
            </TableHead>
          ))}
          {actions && (
            <TableHead className="px-3 text-right" scope="col">
              {actions.header}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.key} className={columnClass(column)}>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            ))}
            {actions && (
              <TableCell className="text-right">
                <Skeleton className="size-6" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  toolbar,
  actions,
  onRowClick,
  isLoading = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  skeletonRows = 5,
  footer,
}: DataTableProps<T>) {
  const body = () => {
    if (isLoading) {
      return <DataTableSkeleton columns={columns} actions={actions} rows={skeletonRows} />;
    }

    if (error) {
      return (
        <div className="p-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className="p-4">
          <EmptyState title={emptyTitle ?? ''} description={emptyDescription} />
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} scope="col" className={headerClass(column)}>
                {column.header}
              </TableHead>
            ))}
            {actions && (
              <TableHead scope="col" className="px-3 text-right">
                {actions.header}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Fragment key={rowKey(row)}>
              <TableRow
                className={onRowClick ? 'cursor-pointer transition-colors' : 'transition-colors'}
                data-ripple={onRowClick ? '' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={columnClass(column)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    className="relative z-10 text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {actions.render(row)}
                  </TableCell>
                )}
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      {toolbar && <DataTableToolbarBar toolbar={toolbar} />}
      {body()}
      {footer}
    </>
  );
}
