import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetPaymentsCache } from '@/hooks/use-payments';
import { toPaymentList } from '@/types/payment';
import { PaymentList } from './payment-list';

const getPayments = vi.fn();
const confirmPayment = vi.fn();
const refundPayment = vi.fn();
const showSuccess = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getPayments: (query: unknown) => getPayments(query),
    confirmPayment: (id: string) => confirmPayment(id),
    refundPayment: (id: string, body: unknown) => refundPayment(id, body),
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  showSuccess: (message: string) => showSuccess(message),
}));

const list = toPaymentList({
  totalRecord: 1,
  currentPage: 1,
  limit: 10,
  itemList: [
    {
      paymentId: 'pay1',
      orderId: 'o1',
      amount: 2480,
      paidAmount: 2480,
      method: 'UPI',
      status: 'PAID',
      isPaid: true,
      orderData: { orderId: 'o1', orderNumber: 'ORD-1', status: 'CONFIRMED', total: 2480 },
    },
  ],
});

describe('PaymentList', () => {
  beforeEach(() => {
    resetPaymentsCache();
    getPayments.mockReset();
    confirmPayment.mockReset();
    refundPayment.mockReset();
    showSuccess.mockReset();
    getPayments.mockResolvedValue({ status: true, message: 'ok', data: list });
    confirmPayment.mockResolvedValue({ status: true, message: 'ok', data: {} });
    refundPayment.mockResolvedValue({ status: true, message: 'ok', data: {} });
  });

  afterEach(() => cleanup());

  it('lists the payments', async () => {
    render(<PaymentList />);

    expect(await screen.findByText('ORD-1')).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  it('confirms a payment from the row menu', async () => {
    render(<PaymentList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Payment actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Confirm payment' }));

    await waitFor(() => expect(confirmPayment).toHaveBeenCalledWith('pay1'));
    expect(showSuccess).toHaveBeenCalledWith('Payment confirmed.');
  });

  it('refunds a payment with a reason', async () => {
    render(<PaymentList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Payment actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Refund payment' }));

    const input = await screen.findByLabelText('Reason');
    fireEvent.change(input, { target: { value: 'Customer request' } });
    fireEvent.click(screen.getByRole('button', { name: 'Refund payment' }));

    await waitFor(() =>
      expect(refundPayment).toHaveBeenCalledWith('pay1', {
        orderId: 'o1',
        amount: 2480,
        reason: 'Customer request',
        mode: 'ORIGINAL',
      }),
    );
    expect(showSuccess).toHaveBeenCalledWith('Payment refunded.');
  });
});
