'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { Pagination } from '@/components/common/pagination';
import { apiService } from '@/lib/api/api.service';
import type { WalletSummaryData, WalletTransactionData, WalletTransactionListData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const PAGE_SIZE = 10;
const walletMessages = MESSAGES.customers.detail.wallet;

type AdjustmentType = 'credit' | 'debit';

const emptySummary = (): WalletSummaryData => ({
  isEnabled: false,
  balance: 0,
  totalCredited: 0,
  totalDebited: 0,
  maxBalance: 0,
  minRedeem: 0,
  expiryDays: 0,
  canRedeem: false,
});

const emptyList = (): WalletTransactionListData => ({
  totalRecord: 0,
  totalPage: 0,
  currentPage: 1,
  limit: PAGE_SIZE,
  hasNext: false,
  hasPrevious: false,
  nextPage: 0,
  previousPage: 0,
  itemList: [],
});

interface CustomerWalletPanelProps {
  userId: string;
}

export function CustomerWalletPanel({ userId }: CustomerWalletPanelProps) {
  const [summary, setSummary] = useState<WalletSummaryData>(emptySummary);
  const [transactions, setTransactions] = useState<WalletTransactionListData>(emptyList);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWallet = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [summaryResponse, transactionResponse] = await Promise.all([
        apiService.getCustomerWalletSummary(userId),
        apiService.getCustomerWalletTransactions(userId, { page, limit: PAGE_SIZE }),
      ]);
      if (!summaryResponse.status) throw new Error(summaryResponse.message);
      if (!transactionResponse.status) throw new Error(transactionResponse.message);
      setSummary(summaryResponse.data);
      setTransactions(transactionResponse.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : walletMessages.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const closeAdjustment = () => {
    if (isSubmitting) return;
    setAdjustmentType(null);
    setAmount('');
    setReason('');
    setReference('');
    setActionError('');
  };

  const submitAdjustment = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setActionError(walletMessages.invalidAmount);
      return;
    }
    if (reason.trim().length < 3) {
      setActionError(walletMessages.invalidReason);
      return;
    }
    if (!adjustmentType) return;

    setIsSubmitting(true);
    setActionError('');
    try {
      const body = {
        userId,
        amount: parsedAmount,
        description: reason.trim(),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
      };
      const response = adjustmentType === 'credit'
        ? await apiService.creditCustomerWallet(body)
        : await apiService.debitCustomerWallet(body);
      if (!response.status) throw new Error(response.message);
      showSuccess(adjustmentType === 'credit' ? walletMessages.credited : walletMessages.debited);
      setAdjustmentType(null);
      setAmount('');
      setReason('');
      setReference('');
      await loadWallet();
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : walletMessages.adjustError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{walletMessages.title}</CardTitle>
          <p className="mt-1 text-sm text-fg-muted">{walletMessages.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!summary.isEnabled || isLoading} onClick={() => setAdjustmentType('credit')}>
            {walletMessages.credit}
          </Button>
          <Button size="sm" variant="outline" disabled={!summary.isEnabled || isLoading || summary.balance <= 0} onClick={() => setAdjustmentType('debit')}>
            {walletMessages.debit}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <FormError message={error} />}
        {!summary.isEnabled && !isLoading && !error && (
          <p className="text-sm text-fg-muted">{walletMessages.disabled}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-fg-muted">{walletMessages.balance}</p>
            <p className="mt-1 text-xl font-semibold">{formatCurrency(summary.balance)}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-fg-muted">{walletMessages.totalCredited}</p>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.totalCredited)}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-fg-muted">{walletMessages.totalDebited}</p>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.totalDebited)}</p>
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{walletMessages.transactions}</h3>
            <RefreshButton onRefresh={() => void loadWallet()} isRefreshing={isLoading} label={walletMessages.refresh} />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-customer-wallet text-sm">
              <thead className="bg-surface-muted text-left text-fg-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">{walletMessages.type}</th>
                  <th className="px-3 py-2 font-medium">{walletMessages.reason}</th>
                  <th className="px-3 py-2 text-right font-medium">{walletMessages.amount}</th>
                  <th className="px-3 py-2 text-right font-medium">{walletMessages.balanceAfter}</th>
                  <th className="px-3 py-2 font-medium">{walletMessages.date}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.itemList.map((row: WalletTransactionData) => (
                  <tr key={row.transactionId} className="border-t border-border">
                    <td className="px-3 py-2">{row.type.replace(/_/g, ' ')}</td>
                    <td className="max-w-wallet-description truncate px-3 py-2" title={row.description}>{row.description || '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.isCredit ? '+' : '-'}{formatCurrency(row.amount)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(row.balanceAfter)}</td>
                    <td className="px-3 py-2">{row.createdAt ? formatRelativeTime(row.createdAt) : '—'}</td>
                  </tr>
                ))}
                {!isLoading && transactions.itemList.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-fg-muted">{walletMessages.empty}</td></tr>
                )}
                {isLoading && (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-fg-muted">{walletMessages.loading}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {transactions.totalRecord > PAGE_SIZE && (
            <div className="mt-3">
              <Pagination
                currentPage={page}
                totalPage={Math.ceil(transactions.totalRecord / PAGE_SIZE)}
                totalRecord={transactions.totalRecord}
                limit={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </CardContent>

      <Dialog
        open={adjustmentType !== null}
        onClose={closeAdjustment}
        title={adjustmentType === 'credit' ? walletMessages.creditTitle : walletMessages.debitTitle}
        description={walletMessages.dialogDescription}
        footer={
          <>
            <Button variant="outline" onClick={closeAdjustment} disabled={isSubmitting}>{walletMessages.cancel}</Button>
            <Button onClick={() => void submitAdjustment()} loading={isSubmitting} disabled={isSubmitting || !amount || reason.trim().length < 3}>
              {adjustmentType === 'credit' ? walletMessages.confirmCredit : walletMessages.confirmDebit}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <FormField label={walletMessages.amount}>
            <Input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
          </FormField>
          <FormField label={walletMessages.reason} hint={walletMessages.requiredReasonHint}>
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={300} rows={3} placeholder={walletMessages.reasonPlaceholder} />
          </FormField>
          <FormField label={walletMessages.reference}>
            <Input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} placeholder={walletMessages.referencePlaceholder} />
          </FormField>
        </div>
      </Dialog>
    </Card>
  );
}
