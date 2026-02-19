// ============================================================
// Integration Catalog — static metadata for each provider
// ============================================================

import type { IntegrationCatalogEntry } from '@/types/integrations';

export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  {
    provider: 'hubspot',
    name: 'HubSpot',
    description: 'Sync deals, contacts, and pipeline stages from your HubSpot CRM to power funnel analytics and deal scoring.',
    category: 'crm',
    auth_type: 'oauth2',
    icon: 'Globe',
    features: [
      { label: 'Deal sync' },
      { label: 'Contact sync' },
      { label: 'Pipeline stage mapping' },
      { label: 'Field mapping' },
    ],
  },
  {
    provider: 'amplitude',
    name: 'Amplitude',
    description: 'Import product analytics events, user properties, and cohorts to measure activation and product-led growth signals.',
    category: 'product_analytics',
    auth_type: 'api_key',
    icon: 'BarChart3',
    features: [
      { label: 'Event sync' },
      { label: 'User property sync' },
      { label: 'Cohort import' },
    ],
  },
  {
    provider: 'google_ads',
    name: 'Google Ads',
    description: 'Pull campaign metrics, keyword performance, and spend data to track paid acquisition efficiency.',
    category: 'advertising',
    auth_type: 'oauth2',
    icon: 'Search',
    features: [
      { label: 'Campaign metrics' },
      { label: 'Keyword performance' },
      { label: 'Spend tracking' },
    ],
  },
  {
    provider: 'meta_ads',
    name: 'Meta Ads',
    description: 'Import campaign metrics, ad set performance, and spend data from Facebook and Instagram advertising.',
    category: 'advertising',
    auth_type: 'oauth2',
    icon: 'Share2',
    features: [
      { label: 'Campaign metrics' },
      { label: 'Ad set performance' },
      { label: 'Spend tracking' },
    ],
  },
];

export function getCatalogEntry(provider: string): IntegrationCatalogEntry | undefined {
  return INTEGRATION_CATALOG.find((c) => c.provider === provider);
}
