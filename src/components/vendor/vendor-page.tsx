'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { VendorDocuments } from '@/components/vendor/vendor-documents';
import { VendorList } from '@/components/vendor/vendor-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

type VendorTab = 'vendors' | 'documents';

export function VendorPage() {
  const [tab, setTab] = useState<VendorTab>('vendors');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={vendors.title} description={vendors.subtitle} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as VendorTab)}>
        <TabsList>
          <TabsTrigger value="vendors">{vendors.vendorsTab}</TabsTrigger>
          <TabsTrigger value="documents">{vendors.documentsTab}</TabsTrigger>
        </TabsList>
        <TabsContent value="vendors">
          <VendorList />
        </TabsContent>
        <TabsContent value="documents">
          <VendorDocuments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
