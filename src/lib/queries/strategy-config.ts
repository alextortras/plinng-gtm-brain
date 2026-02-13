import { createClient } from '@/lib/supabase/server';
import { Database, StrategyConfig, StrategyMode } from '@/types/database';

export async function getActiveStrategyConfig(): Promise<StrategyConfig> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('strategy_config')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    throw new Error(`Failed to fetch strategy config: ${error.message}`);
  }

  return data;
}

export interface StrategyConfigUpdate {
  mode?: StrategyMode;
  max_cac_payback_months?: number;
  max_churn_rate?: number;
  arpa_min?: number;
  arpa_max?: number;
}

type StrategyConfigRow = Database['public']['Tables']['strategy_config']['Update'];

export async function updateStrategyConfig(
  configId: string,
  updates: StrategyConfigUpdate,
  updatedBy: string
): Promise<StrategyConfig> {
  const supabase = await createClient();

  const payload: StrategyConfigRow = {
    ...updates,
    updated_by: updatedBy,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('strategy_config') as any)
    .update(payload)
    .eq('id', configId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update strategy config: ${error.message}`);
  }

  return data;
}
