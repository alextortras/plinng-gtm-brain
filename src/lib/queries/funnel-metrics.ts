import { createClient } from '@/lib/supabase/server';
import { DailyFunnelMetric } from '@/types/database';

export interface FunnelMetricsFilters {
  market?: string;
  motion?: string;
  channel?: string;
  stage?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function getFunnelMetrics(
  filters: FunnelMetricsFilters = {}
): Promise<DailyFunnelMetric[]> {
  const supabase = await createClient();

  let query = supabase
    .from('daily_funnel_metrics')
    .select('*')
    .order('date', { ascending: false });

  if (filters.market) {
    query = query.eq('market', filters.market);
  }
  if (filters.motion) {
    query = query.eq('motion', filters.motion);
  }
  if (filters.channel) {
    query = query.eq('channel', filters.channel);
  }
  if (filters.stage) {
    query = query.eq('funnel_stage', filters.stage);
  }
  if (filters.from) {
    query = query.gte('date', filters.from);
  }
  if (filters.to) {
    query = query.lte('date', filters.to);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch funnel metrics: ${error.message}`);
  }

  return data ?? [];
}
