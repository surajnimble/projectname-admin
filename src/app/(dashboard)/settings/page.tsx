'use client';
import { PermissionGuard } from '@/components/auth/guards';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/use-settings';
import type { SettingListData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function SettingsPage() {
  const {
    data,
    isLoading,
    error,
    page,
    search,
    category,
    setPage,
    setSearch,
    setCategory,
    refresh,
    isActioning,
    fetchSettings,
    updateSetting,
    resetSettings,
  } = useSettings();
  const [editOpen, setEditOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SettingListData['itemList'][number] | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<string>('settings');

  const categories = [
    { key: 'all', label: MESSAGES.settings.categories.all },
    { key: 'app', label: MESSAGES.settings.categories.app },
    { key: 'business', label: MESSAGES.settings.categories.business },
    { key: 'cart', label: MESSAGES.settings.categories.cart },
    { key: 'catalog', label: MESSAGES.settings.categories.catalog },
    { key: 'coupon', label: MESSAGES.settings.categories.coupon },
    { key: 'currency', label: MESSAGES.settings.categories.currency },
    { key: 'customer', label: MESSAGES.settings.categories.customer },
    { key: 'feature', label: MESSAGES.settings.categories.feature },
    { key: 'analytics', label: MESSAGES.settings.categories.analytics },
  ];

  const handleEdit = (setting: SettingListData['itemList'][number]) => {
    setEditingSetting(setting);
    setEditKey(setting.key);
    setEditValue(String(setting.value));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingSetting || !editKey) return;
    const ok = await updateSetting(editKey, editValue);
    if (ok) {
      setEditOpen(false);
      setEditingSetting(null);
      setEditKey('');
      setEditValue('');
    }
  };

  const handleReset = async () => {
    if (!window.confirm(MESSAGES.settings.resetConfirm)) return;
    const ok = await resetSettings();
    if (ok) {
      setEditOpen(false);
      setEditingSetting(null);
      setEditKey('');
      setEditValue('');
    }
  };

  const columns = [
    {
      key: 'key',
      header: MESSAGES.settings.columns.key,
      cell: (row: SettingListData['itemList'][number]) => (
        <span className="text-sm font-mono text-fg-muted">{row.key}</span>
      ),
    },
    {
      key: 'value',
      header: MESSAGES.settings.columns.value,
      cell: (row: SettingListData['itemList'][number]) => (
        <span className="text-sm break-all">{String(row.value)}</span>
      ),
    },
    {
      key: 'category',
      header: MESSAGES.settings.columns.category,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: SettingListData['itemList'][number]) => (
        <span className="text-sm capitalize">{row.category}</span>
      ),
    },
    {
      key: 'isPublic',
      header: MESSAGES.settings.columns.isPublic,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-24',
      cell: (row: SettingListData['itemList'][number]) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${row.isPublic ? 'border-success/20 text-success bg-success/10' : 'border-muted/30 text-muted'}`}>
          {row.isPublic ? MESSAGES.settings.featureEnabled : MESSAGES.settings.featureDisabled}
        </span>
      ),
    },
    {
      key: 'actions',
      header: MESSAGES.common.actions,
      align: 'center',
      width: 'w-24',
      cell: (row: SettingListData['itemList'][number]) => (
        <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
          {MESSAGES.common.editExisting}
        </Button>
      ),
    },
  ] as const;

  const settingsContent = (
    <div className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-auto">
          <Input
            placeholder={MESSAGES.settings.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Label htmlFor="category-filter" className="text-xs text-fg-muted shrink-0">
            {MESSAGES.settings.settingCategoryLabel}
          </Label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-input bg-background rounded-md px-2 py-1 text-sm text-fg focus:ring-2 focus:ring-ring focus:border-ring outline-none"
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            onClick={() => void fetchSettings()}
            disabled={isActioning}
          >
            {MESSAGES.dashboard.refresh}
          </Button>
          <Button variant="destructive" size="sm" onClick={resetSettings} disabled={isActioning}>
            {MESSAGES.settings.resetAll}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data.itemList}
        rowKey={(row: SettingListData['itemList'][number]) => row.settingId}
        toolbar={{
          search: {
            value: search,
            placeholder: MESSAGES.settings.searchPlaceholder,
            onChange: setSearch,
          },
          filters: {
            label: MESSAGES.common.filters,
            count: (search ? 1 : 0) + (category !== 'all' ? 1 : 0),
            onOpen: () => {},
          },
          actions: (
            <Button variant="outline" size="sm" loading={isLoading} onClick={() => void fetchSettings()}>
              {MESSAGES.dashboard.refresh}
            </Button>
          ),
        }}
        actions={{
          header: MESSAGES.common.actions,
          render: (row: SettingListData['itemList'][number]) => (
            <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
              {MESSAGES.common.editExisting}
            </Button>
          ),
        }}
        isLoading={isLoading}
        error={error}
        onRetry={() => void fetchSettings()}
        emptyTitle={MESSAGES.settings.empty}
        emptyDescription={MESSAGES.settings.emptyFiltered}
        footer={
          <Pagination
            currentPage={page}
            totalPage={data.totalPage}
            totalRecord={data.totalRecord}
            limit={data.limit}
            onPageChange={setPage}
          />
        }
      />
    </div>
  );

  const editOverlay = editOpen && editingSetting ? (
    <Card className="fixed inset-0 z-overlay flex items-center justify-center bg-overlay p-4 pointer-events-none">
      <Card className="w-full max-w-md bg-background shadow-lg pointer-events-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-fg mb-2">{MESSAGES.settings.settingUpdated}</h2>
          <p className="text-sm text-fg-muted mb-6">{editingSetting.key}</p>
          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{MESSAGES.settings.settingKeyLabel}</Label>
              <Input value={editKey} readOnly className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{MESSAGES.settings.settingValueLabel}</Label>
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>{MESSAGES.common.cancel}</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isActioning || !editKey || !editValue}>
              {MESSAGES.settings.save}
            </Button>
          </div>
        </div>
      </Card>
    </Card>
  ) : null;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">{MESSAGES.settings.title}</h1>
        <p className="text-fg-muted text-sm">{MESSAGES.settings.subtitle}</p>
      </div>

      <PermissionGuard permission={PERMISSIONS.settingsView}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="settings">{MESSAGES.common.settings}</TabsTrigger>
                <TabsTrigger value="features">{MESSAGES.settings.toggleFeature}</TabsTrigger>
                <TabsTrigger value="maintenance">{MESSAGES.settings.maintenanceTitle}</TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="border-t p-0">
                {settingsContent}
              </TabsContent>

              <TabsContent value="features" className="border-t p-0">
                <FeatureFlagsTab />
              </TabsContent>

              <TabsContent value="maintenance" className="border-t p-0">
                <MaintenanceTab />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </PermissionGuard>

      {editOverlay}
    </div>
  );
}

function FeatureFlagsTab() {
  const { flags, isLoading, error, refresh, fetchFlags, toggleFlag, isActioning } = useSettings();
  const isSaving = isActioning;

  const flagEntries = Object.entries(flags).sort(([a], [b]) => a.localeCompare(b));

  if (isLoading) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        {error}
        <Button variant="outline" size="sm" onClick={() => void refresh()} className="mt-4">{MESSAGES.common.retry}</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flagEntries.map(([key, enabled]) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-fg">{key.replace(/^feature/, '').replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-xs text-fg-muted">{key}</p>
              </div>
              <Switch checked={enabled} onChange={() => void toggleFlag(key, enabled)} disabled={isSaving} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MaintenanceTab() {
  const { status, isLoading, error, refresh, fetchStatus, saveMaintenance, isActioning } = useSettings();
  const isSaving = isActioning;
  const [editOpen, setEditOpen] = useState(false);
  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMessage, setMaintMessage] = useState('');
  const [maintIps, setMaintIps] = useState('');

  if (isLoading) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        {error}
        <Button variant="outline" size="sm" onClick={() => void refresh()} className="mt-4">{MESSAGES.common.retry}</Button>
      </div>
    );
  }

  const handleSave = async () => {
    const ok = await saveMaintenance({
      enabled: maintEnabled,
      message: maintMessage,
      allowedIps: maintIps.split(',').map((ip) => ip.trim()).filter(Boolean),
    });
    if (ok) setEditOpen(false);
  };

  const maintOverlay = editOpen ? (
    <Card className="fixed inset-0 z-overlay flex items-center justify-center bg-overlay p-4 pointer-events-none">
      <Card className="w-full max-w-md bg-background shadow-lg pointer-events-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-fg mb-2">{MESSAGES.settings.maintenanceTitle}</h2>
          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-medium text-fg block mb-2">Maintenance mode</Label>
              <Switch checked={maintEnabled} onChange={setMaintEnabled} />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{MESSAGES.settings.maintenanceMessageLabel}</Label>
              <Input value={maintMessage} onChange={(e) => setMaintMessage(e.target.value)} placeholder="We'll be back soon." className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{MESSAGES.settings.maintenanceAllowedIpsLabel}</Label>
              <Input value={maintIps} onChange={(e) => setMaintIps(e.target.value)} placeholder="192.168.1.1, 10.0.0.1" className="w-full" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>{MESSAGES.common.cancel}</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>{MESSAGES.settings.save}</Button>
          </div>
        </div>
      </Card>
    </Card>
  ) : null;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-fg font-semibold">{MESSAGES.settings.maintenanceTitle}</h2>
            <p className="text-fg-muted text-sm">{MESSAGES.settings.maintenanceSubtitle}</p>
          </div>
          <Switch checked={status.enabled} onChange={() => void setEditOpen(true)} />
        </div>
        <div className="border-t p-4">
          <p className="text-sm text-fg-muted">{status.enabled ? MESSAGES.settings.maintenanceEnabled : MESSAGES.settings.maintenanceDisabled}</p>
          {status.message && <p className="text-sm text-fg mt-2">{status.message}</p>}
          {status.allowedIps.length > 0 && <p className="text-sm text-fg-muted mt-2">Allowed IPs: {status.allowedIps.join(', ')}</p>}
        </div>
      </Card>

      {maintOverlay}
    </div>
  );
}
