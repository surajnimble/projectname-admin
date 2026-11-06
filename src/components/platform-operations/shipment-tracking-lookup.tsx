'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/status-badge';
import { RefreshButton } from '@/components/common/refresh-button';
import { apiService } from '@/lib/api/api.service';
import type { ShipmentTrackingData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const m = MESSAGES.shipmentTracking;
const displayDate = (value: string) => value ? new Date(value).toLocaleString() : m.notAvailable;

export function ShipmentTrackingLookup() {
  const [awb, setAwb] = useState('');
  const [data, setData] = useState<ShipmentTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async () => {
    if (awb.trim().length < 4) { setError(m.empty); return; }
    setLoading(true); setError(''); setData(null);
    const response = await apiService.getAdminShipmentTracking(awb.trim());
    setLoading(false);
    if (response.status) setData(response.data); else setError(response.message);
  };

  return <div className="flex min-h-0 flex-col gap-6">
    <PageHeader
      title={m.title}
      description={m.subtitle}
      action={<RefreshButton onRefresh={track} isRefreshing={loading} disabled={!awb.trim()} label={MESSAGES.dashboard.refresh} />}
    />
    <Card><CardHeader><CardTitle>{m.title}</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><FormField label={m.awb} className="flex-1"><Input value={awb} onChange={(event) => setAwb(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void track(); }} maxLength={40} /></FormField><Button onClick={() => void track()} loading={loading} disabled={loading || !awb.trim()}>{m.search}</Button></div>
      {error && <FormError message={error} />}
    </CardContent></Card>
    {data ? <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>{data.awb}</CardTitle><StatusBadge meta={{ label: data.status || m.notAvailable, intent: data.status === 'DELIVERED' ? 'success' : data.status === 'FAILED' || data.status === 'CANCELLED' ? 'danger' : 'info' }} /></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div><p className="text-fg-muted text-xs">{m.order}</p><p className="font-medium">{data.orderNumber || m.notAvailable}</p></div>
      <div><p className="text-fg-muted text-xs">{m.estimatedDays}</p><p className="font-medium">{data.estimatedDays || m.notAvailable}</p></div>
      <div><p className="text-fg-muted text-xs">{m.shippedAt}</p><p className="font-medium">{displayDate(data.shippedAt)}</p></div>
      <div><p className="text-fg-muted text-xs">{m.deliveredAt}</p><p className="font-medium">{displayDate(data.deliveredAt)}</p></div>
      <div className="sm:col-span-2"><p className="text-fg-muted text-xs">{m.remarks}</p><p className="font-medium">{data.remarks || m.notAvailable}</p></div>
      {data.trackingUrl && <div className="sm:col-span-2 lg:col-span-3"><p className="text-fg-muted text-xs">{m.trackingUrl}</p><a href={data.trackingUrl} target="_blank" rel="noreferrer" className="break-all text-primary underline">{data.trackingUrl}</a></div>}
    </CardContent></Card> : <p className="text-fg-muted text-sm">{m.empty}</p>}
  </div>;
}
