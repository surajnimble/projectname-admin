import { describe, expect, it } from 'vitest';
import { toPaymentList, toPaymentSummary } from './payment';

describe('toPaymentSummary', () => {
  it('maps a payment with its order data', () => {
    expect(
      toPaymentSummary({
        paymentId: 'pay1',
        amount: 2480,
        paidAmount: 2480,
        method: 'UPI',
        status: 'PAID',
        isPaid: true,
        createdAt: '2026-10-21T10:00:00.000Z',
        orderData: { orderId: 'o1', orderNumber: 'ORD-1', status: 'CONFIRMED', total: 2480 },
      }),
    ).toEqual({
      paymentId: 'pay1',
      orderId: '',
      amount: 2480,
      paidAmount: 2480,
      method: 'UPI',
      status: 'PAID',
      reference: '',
      isTokenPayment: false,
      isBalancePayment: false,
      isPaid: true,
      paidAt: '',
      createdAt: '2026-10-21T10:00:00.000Z',
      orderData: { orderId: 'o1', orderNumber: 'ORD-1', status: 'CONFIRMED', total: 2480 },
    });
  });

  it('fills missing fields with safe defaults', () => {
    expect(toPaymentSummary()).toMatchObject({
      paymentId: '',
      amount: 0,
      isPaid: false,
      orderData: { orderNumber: '', total: 0 },
    });
  });
});

describe('toPaymentList', () => {
  it('maps the pagination and skips non-object rows', () => {
    const list = toPaymentList({
      totalRecord: 1,
      currentPage: 1,
      limit: 5,
      itemList: [{ paymentId: 'pay1' }, null],
    });

    expect(list.totalRecord).toBe(1);
    expect(list.currentPage).toBe(1);
    expect(list.limit).toBe(5);
    expect(list.itemList).toHaveLength(1);
    expect(list.itemList[0]?.paymentId).toBe('pay1');
  });
});
