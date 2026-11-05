import { Metadata } from 'next';
import { FlashSaleList } from '@/components/flash-sale/flash-sale-list';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = {
  title: MESSAGES.flashSales.title,
};

export default function FlashSalesPage() {
  return <FlashSaleList />;
}
