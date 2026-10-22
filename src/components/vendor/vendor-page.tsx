'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { VendorDocuments } from '@/components/vendor/vendor-documents';
import { VendorList } from '@/components/vendor/vendor-list';
import { Tabs, type TabItem } from '@/components/ui/tabs';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

type VendorTab = 'vendors' | 'documents';

const TABS: readonly TabItem[] = [
  { value: 'vendors', label: vendors.vendorsTab },
  { value: 'documents', label: vendors.documentsTab },
];

export function VendorPage() {
  const [tab, setTab] = useState<VendorTab>('vendors');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={vendors.title} description={vendors.subtitle} />

      <Tabs items={TABS} value={tab} onChange={(value) => setTab(value as VendorTab)} ariaLabel={vendors.title} />

      <div role="tabpanel" hidden={tab !== 'vendors'}>
        <VendorList />
      </div>

      <div role="tabpanel" hidden={tab !== 'documents'}>
        <VendorDocuments />
      </div>
    </div>
  );
}
