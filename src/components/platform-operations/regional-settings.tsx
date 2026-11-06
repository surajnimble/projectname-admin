'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/api/api.service';
import type { CountryData, CountryListData, CurrencyData, CurrencyListData, TaxConfigData, TaxConfigListData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { PERMISSIONS } from '@/constants';
import { usePermission } from '@/hooks/use-permission';

const m = MESSAGES.platformOperations.regional;
const PAGE_SIZE = 10;
const emptyCountries = (): CountryListData => ({ totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE, hasNext: false, hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [] });
const emptyCurrencies = (): CurrencyListData => ({ currencyList: [], totalRecord: 0 });
const emptyTaxes = (): TaxConfigListData => ({ taxConfigList: [], totalRecord: 0 });
const blankCurrency = () => ({ code: '', name: '', symbol: '', decimals: '2', rate: '1', isDefault: false, isActive: true });
const blankTax = () => ({ name: '', slug: '', percent: '0', cgstPercent: '0', sgstPercent: '0', igstPercent: '0', isInclusive: false, vendorId: '', stateCode: '', isActive: true });

export function RegionalSettings() {
  const { can } = usePermission();
  const canCurrency = can(PERMISSIONS.currencyManage);
  const canTax = can(PERMISSIONS.taxManage);
  const canCountry = can(PERMISSIONS.countryManage);
  const availableTabs = useMemo(() => [
    ...(canCurrency ? ['currencies' as const] : []),
    ...(canTax ? ['taxes' as const] : []),
    ...(canCountry ? ['countries' as const] : []),
  ], [canCurrency, canTax, canCountry]);
  const [tab, setTab] = useState<'currencies' | 'taxes' | 'countries'>(availableTabs[0] || 'currencies');
  const [currencies, setCurrencies] = useState<CurrencyListData>(emptyCurrencies);
  const [taxes, setTaxes] = useState<TaxConfigListData>(emptyTaxes);
  const [countries, setCountries] = useState<CountryListData>(emptyCountries);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyData | null>(null);
  const [editingTax, setEditingTax] = useState<TaxConfigData | null>(null);
  const [currencyForm, setCurrencyForm] = useState(blankCurrency);
  const [taxForm, setTaxForm] = useState(blankTax);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    if (tab === 'currencies') {
      const response = await apiService.getCurrencies({ isActive: false });
      if (response.status) setCurrencies(response.data); else setError(response.message);
    } else if (tab === 'taxes') {
      const response = await apiService.getTaxConfigs({ isActive: false });
      if (response.status) setTaxes(response.data); else setError(response.message);
    } else {
      const response = await apiService.getCountries({ page, limit: PAGE_SIZE });
      if (response.status) setCountries(response.data); else setError(response.message);
    }
    setLoading(false);
  }, [page, tab]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(tab)) {
      const firstAvailableTab = availableTabs[0];
      if (firstAvailableTab) setTab(firstAvailableTab);
    }
  }, [availableTabs, tab]);

  const startCreate = () => {
    setFormError(''); setEditingCurrency(null); setEditingTax(null);
    setCurrencyForm(blankCurrency()); setTaxForm(blankTax()); setDialogOpen(true);
  };
  const editCurrency = (row: CurrencyData) => {
    setFormError(''); setEditingCurrency(row); setEditingTax(null);
    setCurrencyForm({ code: row.code, name: row.name, symbol: row.symbol, decimals: String(row.decimals), rate: String(row.rate), isDefault: row.isDefault, isActive: row.isActive }); setDialogOpen(true);
  };
  const editTax = (row: TaxConfigData) => {
    setFormError(''); setEditingTax(row); setEditingCurrency(null);
    setTaxForm({ name: row.name, slug: row.slug, percent: String(row.percent), cgstPercent: String(row.cgstPercent), sgstPercent: String(row.sgstPercent), igstPercent: String(row.igstPercent), isInclusive: row.isInclusive, vendorId: row.vendorId, stateCode: row.stateCode, isActive: row.isActive }); setDialogOpen(true);
  };

  const saveCurrency = async () => {
    if (currencyForm.code.trim().length !== 3 || currencyForm.name.trim().length < 2 || Number(currencyForm.rate) < 0) { setFormError(m.invalidCurrency); return; }
    setSaving(true); setFormError('');
    const body = { ...(editingCurrency ? {} : { code: currencyForm.code.trim().toUpperCase() }), name: currencyForm.name.trim(), symbol: currencyForm.symbol.trim(), decimals: Number(currencyForm.decimals), rate: Number(currencyForm.rate), isDefault: currencyForm.isDefault, isActive: currencyForm.isActive };
    const response = editingCurrency ? await apiService.updateCurrency(editingCurrency.currencyId, body) : await apiService.createCurrency(body);
    setSaving(false);
    if (!response.status) { setFormError(response.message); return; }
    showSuccess(editingCurrency ? m.currencyUpdated : m.currencyCreated); setDialogOpen(false); await load();
  };
  const saveTax = async () => {
    if (taxForm.name.trim().length < 2 || ![taxForm.percent, taxForm.cgstPercent, taxForm.sgstPercent, taxForm.igstPercent].every((value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) { setFormError(m.invalidTax); return; }
    setSaving(true); setFormError('');
    const body = { ...taxForm, name: taxForm.name.trim(), percent: Number(taxForm.percent), cgstPercent: Number(taxForm.cgstPercent), sgstPercent: Number(taxForm.sgstPercent), igstPercent: Number(taxForm.igstPercent), ...(taxForm.vendorId.trim() ? { vendorId: taxForm.vendorId.trim() } : { vendorId: undefined }), ...(taxForm.stateCode.trim() ? { stateCode: taxForm.stateCode.trim() } : {}) };
    const response = editingTax ? await apiService.updateTaxConfig(editingTax.taxConfigId, body) : await apiService.createTaxConfig(body);
    setSaving(false);
    if (!response.status) { setFormError(response.message); return; }
    showSuccess(editingTax ? m.taxUpdated : m.taxCreated); setDialogOpen(false); await load();
  };
  const removeCurrency = async (row: CurrencyData) => {
    if (!window.confirm(m.confirmCurrencyDelete)) return;
    const response = await apiService.deleteCurrency(row.currencyId);
    if (response.status) { showSuccess(m.currencyDeleted); await load(); } else setError(response.message);
  };
  const removeTax = async (row: TaxConfigData) => {
    if (!window.confirm(m.confirmTaxDelete)) return;
    const response = await apiService.deleteTaxConfig(row.taxConfigId);
    if (response.status) { showSuccess(m.taxDeleted); await load(); } else setError(response.message);
  };
  const seedCountries = async () => {
    if (!window.confirm(m.confirmSeed)) return;
    setSaving(true); const response = await apiService.seedCountries(); setSaving(false);
    if (response.status) { showSuccess(m.seeded); await load(); } else setError(response.message);
  };

  const currencyColumns: DataTableColumn<CurrencyData>[] = [
    { key: 'code', header: m.code, cell: (row) => <span className="font-mono font-semibold">{row.code}</span> },
    { key: 'name', header: m.name, cell: (row) => <span>{row.name}</span> },
    { key: 'symbol', header: m.symbol, cell: (row) => <span>{row.symbol || '—'}</span> },
    { key: 'rate', header: m.exchangeRate, align: 'right', numeric: true, cell: (row) => <span>{row.rate}</span> },
    { key: 'default', header: m.defaultCurrency, cell: (row) => row.isDefault ? <StatusBadge meta={{ label: m.defaultLabel, intent: 'success' }} /> : <span>—</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.isActive ? m.active : m.inactive, intent: row.isActive ? 'success' : 'neutral' }} /> },
  ];
  const taxColumns: DataTableColumn<TaxConfigData>[] = [
    { key: 'name', header: m.name, cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-fg-muted text-xs">{row.slug}</p></div> },
    { key: 'percent', header: m.totalTax, align: 'right', numeric: true, cell: (row) => <span>{row.percent}%</span> },
    { key: 'components', header: m.taxComponents, hideBelow: 'lg', cell: (row) => <span className="text-xs">CGST {row.cgstPercent}% · SGST {row.sgstPercent}% · IGST {row.igstPercent}%</span> },
    { key: 'state', header: m.stateCode, hideBelow: 'xl', cell: (row) => <span>{row.stateCode || '—'}</span> },
    { key: 'inclusive', header: m.inclusive, cell: (row) => <span>{row.isInclusive ? MESSAGES.common.yes : MESSAGES.common.no}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.isActive ? m.active : m.inactive, intent: row.isActive ? 'success' : 'neutral' }} /> },
  ];
  const countryColumns: DataTableColumn<CountryData>[] = [
    { key: 'code', header: m.countryCode, cell: (row) => <span className="font-mono font-semibold">{row.code}</span> },
    { key: 'name', header: m.name, cell: (row) => <span>{row.name}</span> },
    { key: 'dial', header: m.dialCode, cell: (row) => <span>{row.dialCode || '—'}</span> },
    { key: 'currency', header: m.currencyCode, cell: (row) => <span>{row.currency || '—'}</span> },
    { key: 'states', header: m.states, align: 'right', numeric: true, cell: (row) => <span>{row.stateCount}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.isActive ? m.active : m.inactive, intent: row.isActive ? 'success' : 'neutral' }} /> },
  ];

  if (!availableTabs.length) return <div className="space-y-4"><PageHeader title={m.title} description={m.subtitle} /><FormError message={MESSAGES.errors.forbidden} /></div>;

  return <div className="flex min-h-0 flex-col gap-6">
    <PageHeader title={m.title} description={m.subtitle} action={tab !== 'countries' ? <Button onClick={startCreate}>{tab === 'currencies' ? m.createCurrency : m.createTax}</Button> : canCountry ? <Button onClick={() => void seedCountries()} loading={saving} disabled={saving}>{m.seedCountries}</Button> : undefined} />
    <div className="flex flex-wrap gap-2">{availableTabs.map((item) => <Button key={item} size="sm" variant={tab === item ? 'default' : 'outline'} onClick={() => { setTab(item); setPage(1); }}>{item === 'currencies' ? m.currenciesTab : item === 'taxes' ? m.taxesTab : m.countriesTab}</Button>)}</div>
    <Card className="overflow-hidden">
      {tab === 'currencies' ? <DataTable columns={currencyColumns} rows={currencies.currencyList} rowKey={(row) => row.currencyId} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.emptyCurrencies} toolbar={{ actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={m.refresh} /> }} actions={{ header: MESSAGES.common.actions, render: (row) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => editCurrency(row)}>{MESSAGES.common.editExisting}</Button><Button size="sm" variant="ghostDestructive" onClick={() => void removeCurrency(row)}>{MESSAGES.common.delete}</Button></div> }} />
      : tab === 'taxes' ? <DataTable columns={taxColumns} rows={taxes.taxConfigList} rowKey={(row) => row.taxConfigId} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.emptyTaxes} toolbar={{ actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={m.refresh} /> }} actions={{ header: MESSAGES.common.actions, render: (row) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => editTax(row)}>{MESSAGES.common.editExisting}</Button><Button size="sm" variant="ghostDestructive" onClick={() => void removeTax(row)}>{MESSAGES.common.delete}</Button></div> }} />
      : <DataTable columns={countryColumns} rows={countries.itemList} rowKey={(row) => row.countryId} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.emptyCountries} toolbar={{ actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={m.refresh} /> }} footer={<Pagination currentPage={page} totalPage={Math.max(1, countries.totalPage)} totalRecord={countries.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />} />}
    </Card>

    <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} title={tab === 'currencies' ? (editingCurrency ? m.editCurrency : m.createCurrency) : (editingTax ? m.editTax : m.createTax)} description={tab === 'currencies' ? m.currencyDescription : m.taxDescription} footer={<><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>{MESSAGES.common.cancel}</Button><Button onClick={() => void (tab === 'currencies' ? saveCurrency() : saveTax())} loading={saving} disabled={saving}>{MESSAGES.common.save}</Button></>}>
      <div className="max-h-regional-form space-y-4 overflow-y-auto pr-1">{formError && <FormError message={formError} />}
        {tab === 'currencies' ? <>
          <FormField label={m.code}><Input value={currencyForm.code} onChange={(event) => setCurrencyForm((old) => ({ ...old, code: event.target.value.toUpperCase() }))} maxLength={3} disabled={!!editingCurrency} /></FormField>
          <FormField label={m.name}><Input value={currencyForm.name} onChange={(event) => setCurrencyForm((old) => ({ ...old, name: event.target.value }))} maxLength={80} /></FormField>
          <FormField label={m.symbol}><Input value={currencyForm.symbol} onChange={(event) => setCurrencyForm((old) => ({ ...old, symbol: event.target.value }))} maxLength={8} /></FormField>
          <FormField label={m.decimals}><Input type="number" min="0" max="4" value={currencyForm.decimals} onChange={(event) => setCurrencyForm((old) => ({ ...old, decimals: event.target.value }))} /></FormField>
          <FormField label={m.exchangeRate}><Input type="number" min="0" step="any" value={currencyForm.rate} onChange={(event) => setCurrencyForm((old) => ({ ...old, rate: event.target.value }))} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={currencyForm.isDefault} onChange={(event) => setCurrencyForm((old) => ({ ...old, isDefault: event.target.checked }))} />{m.defaultCurrency}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={currencyForm.isActive} onChange={(event) => setCurrencyForm((old) => ({ ...old, isActive: event.target.checked }))} />{m.active}</label>
        </> : <>
          <FormField label={m.name}><Input value={taxForm.name} onChange={(event) => setTaxForm((old) => ({ ...old, name: event.target.value }))} maxLength={120} /></FormField>
          <FormField label={m.slug} hint={m.slugHint}><Input value={taxForm.slug} onChange={(event) => setTaxForm((old) => ({ ...old, slug: event.target.value.toLowerCase() }))} maxLength={80} /></FormField>
          <FormField label={m.totalTax}><Input type="number" min="0" max="100" step="0.01" value={taxForm.percent} onChange={(event) => setTaxForm((old) => ({ ...old, percent: event.target.value }))} /></FormField>
          <div className="grid grid-cols-3 gap-3"><FormField label="CGST %"><Input type="number" min="0" max="100" value={taxForm.cgstPercent} onChange={(event) => setTaxForm((old) => ({ ...old, cgstPercent: event.target.value }))} /></FormField><FormField label="SGST %"><Input type="number" min="0" max="100" value={taxForm.sgstPercent} onChange={(event) => setTaxForm((old) => ({ ...old, sgstPercent: event.target.value }))} /></FormField><FormField label="IGST %"><Input type="number" min="0" max="100" value={taxForm.igstPercent} onChange={(event) => setTaxForm((old) => ({ ...old, igstPercent: event.target.value }))} /></FormField></div>
          <FormField label={m.vendorId}><Input value={taxForm.vendorId} onChange={(event) => setTaxForm((old) => ({ ...old, vendorId: event.target.value }))} /></FormField>
          <FormField label={m.stateCode}><Input value={taxForm.stateCode} onChange={(event) => setTaxForm((old) => ({ ...old, stateCode: event.target.value.toUpperCase() }))} maxLength={10} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxForm.isInclusive} onChange={(event) => setTaxForm((old) => ({ ...old, isInclusive: event.target.checked }))} />{m.inclusive}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxForm.isActive} onChange={(event) => setTaxForm((old) => ({ ...old, isActive: event.target.checked }))} />{m.active}</label>
        </>}
      </div>
    </Dialog>
  </div>;
}
