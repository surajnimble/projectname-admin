'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EntityDialog } from '@/components/common/entity-dialog';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { StatusBadge } from '@/components/common/status-badge';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SETTINGS_PAGE_SIZE } from '@/constants';
import { useSettings } from '@/hooks/use-settings';
import type { SettingListData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { settings, common } = MESSAGES;

const CATEGORY_OPTIONS = [
  { key: 'all', label: settings.categories.all },
  { key: 'app', label: settings.categories.app },
  { key: 'business', label: settings.categories.business },
  { key: 'cart', label: settings.categories.cart },
  { key: 'catalog', label: settings.categories.catalog },
  { key: 'coupon', label: settings.categories.coupon },
  { key: 'currency', label: settings.categories.currency },
  { key: 'customer', label: settings.categories.customer },
  { key: 'feature', label: settings.categories.feature },
  { key: 'analytics', label: settings.categories.analytics },
] as const;

type SettingsTab = 'settings' | 'features' | 'maintenance';

export function SettingsPage() {
  const {
    data,
    flags,
    status,
    isLoading,
    error,
    isActioning,
    page,
    search,
    category,
    setPage,
    setSearch,
    setCategory,
    refresh,
    fetchSettings,
    updateSetting,
    resetSettings,
    toggleFlag,
    saveMaintenance,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('settings');
  const [editDialogKey, setEditDialogKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SettingListData['itemList'][number] | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [maintDialogKey, setMaintDialogKey] = useState(0);
  const [maintOpen, setMaintOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(category);

  const activeFilterCount = (search ? 1 : 0) + (category !== 'all' ? 1 : 0);

  const handleEdit = (setting: SettingListData['itemList'][number]) => {
    setEditingSetting(setting);
    setEditDialogKey((k) => k + 1);
    setEditOpen(true);
  };

  const handleSave = async (values: Record<string, unknown>) => {
    if (!editingSetting) return;
    const ok = await updateSetting(editingSetting.key, String(values.value ?? ''));
    if (ok) {
      setEditOpen(false);
      setEditingSetting(null);
    }
  };

  const handleReset = async () => {
    const ok = await resetSettings();
    if (ok) setResetOpen(false);
  };

  const openFilters = () => {
    setDraftCategory(category);
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraftCategory('all');
  };

  const applyDraft = () => {
    setCategory(draftCategory);
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'key',
      header: settings.columns.key,
      cell: (row: SettingListData['itemList'][number]) => (
        <span className="text-sm font-mono text-fg-muted">{row.key}</span>
      ),
    },
    {
      key: 'value',
      header: settings.columns.value,
      cell: (row: SettingListData['itemList'][number]) => (
        <span className="text-sm break-all">{String(row.value)}</span>
      ),
    },
    {
      key: 'category',
      header: settings.columns.category,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: SettingListData['itemList'][number]) => (
        <span className="text-sm capitalize">{row.category}</span>
      ),
    },
    {
      key: 'isPublic',
      header: settings.columns.isPublic,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-24',
      cell: (row: SettingListData['itemList'][number]) => (
        <StatusBadge
          meta={{
            label: row.isPublic ? settings.featureEnabled : settings.featureDisabled,
            intent: row.isPublic ? 'success' : 'neutral',
          }}
        />
      ),
    },
    {
      key: 'actions',
      header: common.actions,
      align: 'center',
      width: 'w-24',
      cell: (row: SettingListData['itemList'][number]) => (
        <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
          {common.editExisting}
        </Button>
      ),
    },
  ] as const;

  const settingsContent = (
    <div className="p-6">
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={data.itemList}
          rowKey={(row) => row.settingId}
          toolbar={{
            search: {
              value: search,
              placeholder: settings.searchPlaceholder,
              onChange: setSearch,
            },
            filters: {
              label: common.filters,
              count: activeFilterCount,
              onOpen: openFilters,
            },
            actions: (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  loading={isLoading}
                  onClick={() => void refresh()}
                  className="shrink-0"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {MESSAGES.dashboard.refresh}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setResetOpen(true)}
                  disabled={isActioning}
                  className="shrink-0"
                >
                  {settings.resetAll}
                </Button>
              </>
            ),
          }}
        actions={{
          header: common.actions,
          render: (row: SettingListData['itemList'][number]) => (
            <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
              {common.editExisting}
            </Button>
          ),
        }}
        isLoading={isLoading}
        error={error}
        onRetry={() => void fetchSettings()}
        emptyTitle={settings.empty}
        emptyDescription={settings.emptyFiltered}
        footer={
          <Pagination
            currentPage={data.currentPage || page}
            totalPage={data.totalPage}
            totalRecord={data.totalRecord}
            limit={data.limit || SETTINGS_PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      />
      </Card>
      <FilterSheet
        open={filtersOpen}
        title={common.filters}
        onClose={() => setFiltersOpen(false)}
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={settings.settingCategoryLabel}>
          {CATEGORY_OPTIONS.map((c) => (
            <FilterOption
              key={c.key}
              label={c.label}
              selected={draftCategory === c.key}
              onSelect={() => setDraftCategory(c.key)}
            />
          ))}
        </FilterGroup>
      </FilterSheet>
      <EntityDialog
        key={editDialogKey}
        open={editOpen}
        mode="edit"
        title={common.editExisting}
        submitLabel={common.save}
        fields={[
          { key: 'key', label: settings.settingKeyLabel, type: 'text' },
          { key: 'value', label: settings.settingValueLabel, type: 'text' },
        ]}
        defaultValues={{
          key: editingSetting?.key ?? '',
          value: String(editingSetting?.value ?? ''),
        }}
        isSubmitting={isActioning}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        open={resetOpen}
        title={settings.reset}
        description={settings.resetConfirm}
        confirmLabel={common.reset}
        isSubmitting={isActioning}
        onConfirm={() => void handleReset()}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );

  const featuresContent = (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-2">
          <Spinner className="size-8" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(flags)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, enabled]) => (
              <Card key={key} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-fg">
                      {key.replace(/^feature/, '').replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-fg-muted">{key}</p>
                  </div>
                  <Switch
                    checked={enabled}
                    onChange={() => void toggleFlag(key, enabled)}
                    disabled={isActioning}
                  />
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );

  const maintenanceContent = (
    <div className="p-6 space-y-6">
      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-2">
          <Spinner className="size-8" />
        </div>
      ) : (
        <>
          <Card>
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-fg font-semibold">{settings.maintenanceTitle}</h2>
            <p className="text-fg-muted text-sm">{settings.maintenanceSubtitle}</p>
          </div>
          <Switch
            checked={status.enabled}
            onChange={() => {
              setMaintDialogKey((k) => k + 1);
              setMaintOpen(true);
            }}
          />
        </div>
        <div className="border-t p-4">
          <p className="text-sm text-fg-muted">
            {status.enabled ? settings.maintenanceEnabled : settings.maintenanceDisabled}
          </p>
          {status.message && <p className="text-sm text-fg mt-2">{status.message}</p>}
          {status.allowedIps.length > 0 && (
            <p className="text-sm text-fg-muted mt-2">
              {settings.maintenanceAllowedIpsLabel}: {status.allowedIps.join(', ')}
            </p>
          )}
        </div>
      </Card>
      <EntityDialog
        key={maintDialogKey}
        open={maintOpen}
        mode="edit"
        title={settings.maintenanceTitle}
        submitLabel={common.save}
        fields={[
          { key: 'enabled', label: settings.maintenanceTitle, type: 'switch' },
          { key: 'message', label: settings.maintenanceMessageLabel, type: 'text' },
          { key: 'allowedIps', label: settings.maintenanceAllowedIpsLabel, type: 'text' },
        ]}
        defaultValues={{
          enabled: status.enabled,
          message: status.message,
          allowedIps: status.allowedIps.join(', '),
        }}
        isSubmitting={isActioning}
        onClose={() => setMaintOpen(false)}
        onSubmit={async (values: Record<string, unknown>) => {
          const ok = await saveMaintenance({
            enabled: values.enabled === true,
            message: String(values.message ?? ''),
            allowedIps: String(values.allowedIps ?? '').split(',').map((ip) => ip.trim()).filter(Boolean),
          });
          if (ok) setMaintOpen(false);
        }}
      />
      </>
    )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={settings.title}
        description={settings.subtitle}
        action={
          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            onClick={() => void refresh()}
            disabled={isActioning}
          >
            {MESSAGES.dashboard.refresh}
          </Button>
        }
      />
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">{common.settings}</TabsTrigger>
          <TabsTrigger value="features">{settings.toggleFeature}</TabsTrigger>
          <TabsTrigger value="maintenance">{settings.maintenanceTitle}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="border-t p-0">
          {settingsContent}
        </TabsContent>

        <TabsContent value="features" className="border-t p-0">
          {featuresContent}
        </TabsContent>

        <TabsContent value="maintenance" className="border-t p-0">
          {maintenanceContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
