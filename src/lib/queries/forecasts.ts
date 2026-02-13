import { createClient } from '@/lib/supabase/server';
import { RevenueForecast, RevenueType, SalesMotion } from '@/types/database';

export interface ForecastFilters {
  revenueType?: RevenueType;
  motion?: SalesMotion;
  generatedAt?: string;
  limit?: number;
}

/**
 * Get the latest forecast results, optionally filtered.
 */
export async function getForecasts(
  filters: ForecastFilters = {}
): Promise<RevenueForecast[]> {
  const supabase = await createClient();

  let query = supabase
    .from('revenue_forecasts')
    .select('*')
    .order('generated_at', { ascending: false });

  if (filters.revenueType) {
    query = query.eq('revenue_type', filters.revenueType);
  }
  if (filters.motion) {
    query = query.eq('motion', filters.motion);
  }
  if (filters.generatedAt) {
    query = query.eq('generated_at', filters.generatedAt);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch forecasts: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get the latest generation timestamp.
 */
export async function getLatestForecastTimestamp(): Promise<string | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('revenue_forecasts') as any)
    .select('generated_at')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return (data as { generated_at: string }).generated_at;
}

/**
 * Insert forecast segments into the database.
 */
export async function insertForecasts(
  forecasts: Omit<RevenueForecast, 'id' | 'created_at'>[]
): Promise<void> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('revenue_forecasts') as any).insert(forecasts);

  if (error) {
    throw new Error(`Failed to insert forecasts: ${error.message}`);
  }
}
