import type { Metadata } from 'next';
import { PaymentList } from '@/components/payment/payment-list';
import { PageHeader } from '@/components/common/page-header';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.payments.title };

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={MESSAGES.payments.title} description={MESSAGES.payments.subtitle} />
      <PaymentList />
    </div>
  );
}
