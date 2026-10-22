import { describe, expect, it } from 'vitest';
import { toPayout, toPayoutList, toPayoutStatement } from './payout';

describe('toPayout', () => {
  it('maps a payout with its bank data', () => {
    const payout = toPayout({
      payoutId: 'p1',
      vendorId: 'v1',
      amount: 5000,
      method: 'BANK',
      status: 'PENDING',
      period: '2026-10',
      isPending: true,
      createdAt: '2026-10-21T10:00:00.000Z',
      bankData: { bankHolderName: 'Rahul', bankIfsc: 'HDFC0001', accountNo: 'XXXX1111' },
    });

    expect(payout.payoutId).toBe('p1');
    expect(payout.amount).toBe(5000);
    expect(payout.isPending).toBe(true);
    expect(payout.bankData.accountNo).toBe('XXXX1111');
  });

  it('fills missing fields with safe defaults', () => {
    expect(toPayout()).toMatchObject({ payoutId: '', amount: 0, isPending: false });
  });
});

describe('toPayoutList', () => {
  it('maps the pagination and the rows', () => {
    const list = toPayoutList({
      totalRecord: 1,
      currentPage: 1,
      limit: 5,
      itemList: [{ payoutId: 'p1' }, null],
    });

    expect(list.totalRecord).toBe(1);
    expect(list.itemList).toHaveLength(1);
    expect(list.itemList[0]?.payoutId).toBe('p1');
  });

  it('returns an empty list when itemList is missing', () => {
    expect(toPayoutList({ totalRecord: 2 }).itemList).toEqual([]);
  });
});

describe('toPayoutStatement', () => {
  it('maps the totals and the earnings', () => {
    const statement = toPayoutStatement({
      grossAmount: 10000,
      commissionAmount: 1000,
      netAmount: 9000,
      earningList: [
        {
          earningId: 'e1',
          orderId: 'o1',
          amount: 10000,
          netAmount: 9000,
          commission: 1000,
          status: 'AVAILABLE',
          createdAt: '2026-10-21T10:00:00.000Z',
        },
      ],
    });

    expect(statement.grossAmount).toBe(10000);
    expect(statement.netAmount).toBe(9000);
    expect(statement.earningList[0]?.orderId).toBe('o1');
  });

  it('fills missing fields with safe defaults', () => {
    expect(toPayoutStatement()).toEqual({
      grossAmount: 0,
      commissionAmount: 0,
      netAmount: 0,
      earningList: [],
    });
  });
});
