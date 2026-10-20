import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DetailCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DetailCard({ title, description, children, className }: DetailCardProps) {
  return (
    <Card className={className}>
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

interface DetailItemProps {
  label: string;
  value: ReactNode;
}

export function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-fg-muted text-xs">{label}</span>
      <span className="text-fg text-sm font-medium break-words">{value}</span>
    </div>
  );
}

export function PendingItem({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-fg-muted text-xs">{label}</span>
      <Skeleton className="h-4 w-28" />
    </div>
  );
}
