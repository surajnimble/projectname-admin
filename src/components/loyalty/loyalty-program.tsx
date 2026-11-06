'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api/api.service';
import type { LoyaltyTierData, LoyaltyTierListData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const m = MESSAGES.loyaltyProgram;

export function LoyaltyProgram() {
  const [tiers, setTiers] = useState<LoyaltyTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const response = await apiService.getLoyaltyTiers();
    if (response.status) setTiers(response.data.loyaltyTierList);
    else setError(response.message);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const columns: DataTableColumn<LoyaltyTierData>[] = [
    { key: 'name', header: m.tier, cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'minPoints', header: m.minimumPoints, align: 'right', numeric: true, cell: (row) => <span>{row.minPoints.toLocaleString()}</span> },
    { key: 'multiplier', header: m.multiplier, align: 'right', numeric: true, cell: (row) => <span>{row.multiplier.toFixed(2)}×</span> },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <PageHeader title={m.title} description={m.subtitle} />
      <Card className="overflow-hidden">
        <DataTable columns={columns} rows={tiers} rowKey={(row) => row.name} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.empty}
          toolbar={{ title: m.tiers, actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label="Refresh" /> }} />
      </Card>
      <p className="text-sm text-fg-muted">{m.settingsNote}</p>
    </div>
  );
}
