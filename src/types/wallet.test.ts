import { describe, expect, it } from 'vitest';
import { toWalletSummary, toWalletTransactionList } from './wallet';

describe('wallet response mappers', () => {
  it('maps summary values without trusting malformed numbers', () => {
    expect(toWalletSummary({ isEnabled: true, balance: '125.5', totalCredited: 200, totalDebited: 'bad' })).toMatchObject({
      isEnabled: true,
      balance: 125.5,
      totalCredited: 200,
      totalDebited: 0,
    });
  });

  it('maps the walletList page envelope from the backend', () => {
    const result = toWalletTransactionList({
      totalRecord: 1,
      currentPage: 1,
      limit: 10,
      walletList: [{ transactionId: 'txn_1', type: 'CREDIT', amount: 50, balanceAfter: 50, isCredit: true }],
    });
    expect(result.itemList).toHaveLength(1);
    expect(result.itemList[0]).toMatchObject({ transactionId: 'txn_1', amount: 50, isCredit: true });
  });
});
