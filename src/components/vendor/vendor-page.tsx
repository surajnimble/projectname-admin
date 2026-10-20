'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { VendorDocuments } from '@/components/vendor/vendor-documents';
import { VendorList } from '@/components/vendor/vendor-list';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

type VendorTab = 'vendors' | 'documents';

export function VendorPage() {
  const [tab, setTab] = useState<VendorTab>('vendors');
  const [visited, setVisited] = useState<Record<VendorTab, boolean>>({
    vendors: true,
    documents: false,
  });

  const selectTab = (next: VendorTab) => {
    setVisited((current) => ({ ...current, [next]: true }));
    setTab(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={vendors.title} description={vendors.subtitle} />

      <div role="tablist" aria-label={vendors.title} className="flex flex-wrap items-center gap-2">
        <Button
          role="tab"
          aria-selected={tab === 'vendors'}
          variant={tab === 'vendors' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => selectTab('vendors')}
        >
          {vendors.vendorsTab}
        </Button>
        <Button
          role="tab"
          aria-selected={tab === 'documents'}
          variant={tab === 'documents' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => selectTab('documents')}
        >
          {vendors.documentsTab}
        </Button>
      </div>

      <div role="tabpanel" hidden={tab !== 'vendors'}>
        <VendorList />
      </div>

      {visited.documents && (
        <div role="tabpanel" hidden={tab !== 'documents'}>
          <VendorDocuments />
        </div>
      )}
    </div>
  );
}
