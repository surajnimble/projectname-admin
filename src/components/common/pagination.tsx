import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/messages';

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  totalRecord: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPage,
  totalRecord,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalRecord === 0) return null;

  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalRecord);

  return (
    <div className="border-border flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-fg-muted text-sm">{MESSAGES.common.resultSummary(from, to, totalRecord)}</p>
      <div className="flex items-center gap-3">
        <span className="text-fg-muted text-sm">{MESSAGES.common.pageOf(currentPage, totalPage)}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            {MESSAGES.common.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            {MESSAGES.common.next}
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
