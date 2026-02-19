'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Tabs } from '@/components/ui/tabs';
import { IntegrationCard } from '@/components/integrations/integration-card';
import { Loader2, Shield } from 'lucide-react';
import type { IntegrationWithStatus } from '@/types/integrations';

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'crm', label: 'CRM' },
  { value: 'product_analytics', label: 'Product Analytics' },
  { value: 'advertising', label: 'Advertising' },
];

export default function IntegrationsPage() {
  const { data: integrations, loading } = useApi<IntegrationWithStatus[]>('/api/integrations');
  const [category, setCategory] = useState('all');

  const filtered = integrations?.filter(
    (i) => category === 'all' || i.category === category
  ) ?? [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Data Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect external data sources to replace mock data with real pipeline, spend, and product analytics.
        </p>
      </div>

      {/* Category filter */}
      <Tabs
        tabs={CATEGORY_TABS}
        defaultValue="all"
        onValueChange={setCategory}
        variant="underline"
      />

      {/* Integration grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integration) => (
          <IntegrationCard key={integration.provider} integration={integration} />
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No integrations found in this category.
        </div>
      )}

      {/* Read-only footer */}
      <div className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span>All integrations are read-only. GTM Brain never writes to external platforms.</span>
      </div>
    </div>
  );
}
