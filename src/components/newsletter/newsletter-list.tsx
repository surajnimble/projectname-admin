'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/status-badge';
import { apiService } from '@/lib/api/api.service';
import type { NewsletterSubscriberData, NewsletterSubscriberListData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const m = MESSAGES.newsletter;
const PAGE_SIZE = 10;
const emptyPage = (): NewsletterSubscriberListData => ({
  totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE, hasNext: false,
  hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [],
});

export function NewsletterList() {
  const [data, setData] = useState<NewsletterSubscriberListData>(emptyPage);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'ALL'>('true');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaign, setCampaign] = useState({ subject: '', body: '', templateKey: '' });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const response = await apiService.getNewsletterSubscribers({
      page, limit: PAGE_SIZE, ...(activeFilter === 'ALL' ? {} : { isActive: activeFilter }),
    });
    if (response.status) setData(response.data); else setError(response.message);
    setLoading(false);
  }, [page, activeFilter]);
  useEffect(() => { void load(); }, [load]);

  const send = async () => {
    if (campaign.subject.trim().length < 2 || campaign.body.trim().length < 2) {
      setActionError('Enter a subject and email body before sending.'); return;
    }
    setSaving(true); setActionError('');
    const response = await apiService.sendNewsletterCampaign({
      subject: campaign.subject.trim(), body: campaign.body.trim(),
      ...(campaign.templateKey.trim() ? { templateKey: campaign.templateKey.trim() } : {}),
    });
    setSaving(false);
    if (!response.status) { setActionError(response.message || m.queueError); return; }
    showSuccess(m.queued); setCampaignOpen(false); setCampaign({ subject: '', body: '', templateKey: '' });
  };

  const columns: DataTableColumn<NewsletterSubscriberData>[] = [
    { key: 'email', header: m.email, cell: (row) => <span className="font-medium">{row.email}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.isSubscribed && row.isActive ? m.active : m.inactive, intent: row.isSubscribed && row.isActive ? 'success' : 'neutral' }} /> },
    { key: 'subscribed', header: m.subscribed, hideBelow: 'lg', cell: (row) => <span>{row.subscribedAt ? formatRelativeTime(row.subscribedAt) : '—'}</span> },
    { key: 'unsubscribed', header: m.unsubscribed, hideBelow: 'xl', cell: (row) => <span>{row.unsubscribedAt ? formatRelativeTime(row.unsubscribedAt) : '—'}</span> },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <PageHeader title={m.title} description={m.subtitle}
        action={<Button onClick={() => { setActionError(''); setCampaignOpen(true); }} disabled={data.totalRecord === 0 && !loading}>{m.campaign}</Button>} />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns} rows={data.itemList} rowKey={(row) => row.subscriberId}
          isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.empty}
          toolbar={{
            select: { value: activeFilter, ariaLabel: m.status, placeholder: m.allStatuses,
              options: [
                { value: 'ALL', label: m.allStatuses }, { value: 'true', label: m.active }, { value: 'false', label: m.inactive },
              ], onChange: (value) => {
                if (value === 'ALL' || value === 'true' || value === 'false') setActiveFilter(value);
                setPage(1);
              },
            },
            actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label="Refresh" />,
          }}
          footer={<Pagination currentPage={page} totalPage={Math.ceil(data.totalRecord / PAGE_SIZE)} totalRecord={data.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />}
        />
      </Card>
      <Dialog open={campaignOpen} onClose={() => !saving && setCampaignOpen(false)} title={m.campaignTitle} description={m.campaignDescription}
        footer={<><Button variant="outline" onClick={() => setCampaignOpen(false)} disabled={saving}>Cancel</Button><Button onClick={() => void send()} loading={saving} disabled={saving || campaign.subject.trim().length < 2 || campaign.body.trim().length < 2}>Queue campaign</Button></>}>
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <FormField label={m.subject}><Input value={campaign.subject} maxLength={160} onChange={(event) => setCampaign((v) => ({ ...v, subject: event.target.value }))} /></FormField>
          <FormField label={m.body} hint="The email body is interpreted as HTML by the email worker."><Textarea rows={7} maxLength={20000} value={campaign.body} onChange={(event) => setCampaign((v) => ({ ...v, body: event.target.value }))} /></FormField>
          <FormField label={m.templateKey}><Input value={campaign.templateKey} maxLength={60} onChange={(event) => setCampaign((v) => ({ ...v, templateKey: event.target.value }))} /></FormField>
        </div>
      </Dialog>
    </div>
  );
}
