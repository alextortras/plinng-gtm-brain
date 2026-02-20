'use client';

import { useMemo } from 'react';
import { useApi } from '@/hooks/use-api';
import type { DailyFunnelMetric } from '@/types/database';

interface DimensionOption {
  value: string;
  label: string;
}

interface UseDimensionOptionsResult {
  stageOptions: DimensionOption[];
  marketOptions: DimensionOption[];
  channelOptions: DimensionOption[];
  motionOptions: DimensionOption[];
  loading: boolean;
}

function titleCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const LABEL_OVERRIDES: Record<string, string> = {
  us: 'US',
  plg: 'PLG',
};

function extractDistinct(
  data: DailyFunnelMetric[] | null,
  field: 'funnel_stage' | 'market' | 'channel' | 'motion',
  allLabel: string
): DimensionOption[] {
  if (!data) return [{ value: '', label: allLabel }];

  const values = new Set<string>();
  for (const row of data) {
    const val = row[field];
    if (val) values.add(val);
  }

  const sorted = Array.from(values).sort();
  return [
    { value: '', label: allLabel },
    ...sorted.map((v) => ({ value: v, label: LABEL_OVERRIDES[v] ?? titleCase(v) })),
  ];
}

export function useDimensionOptions(): UseDimensionOptionsResult {
  const { data, loading } = useApi<DailyFunnelMetric[]>('/api/funnel-metrics', { limit: '2000' });

  const stageOptions = useMemo(() => extractDistinct(data, 'funnel_stage', 'All Stages'), [data]);
  const marketOptions = useMemo(() => extractDistinct(data, 'market', 'All Markets'), [data]);
  const channelOptions = useMemo(() => extractDistinct(data, 'channel', 'All Channels'), [data]);
  const motionOptions = useMemo(() => extractDistinct(data, 'motion', 'All Motions'), [data]);

  return { stageOptions, marketOptions, channelOptions, motionOptions, loading };
}
