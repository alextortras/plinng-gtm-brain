import { createClient } from '@/lib/supabase/server';
import { AccountScore, ScoreType } from '@/types/database';

export interface AccountScoresFilters {
  type?: ScoreType;
  stalled?: boolean;
  accountId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function getAccountScores(
  filters: AccountScoresFilters = {}
): Promise<AccountScore[]> {
  const supabase = await createClient();

  let query = supabase
    .from('account_scores')
    .select('*')
    .order('score_date', { ascending: false });

  if (filters.type) {
    query = query.eq('score_type', filters.type);
  }
  if (filters.stalled !== undefined) {
    query = query.eq('is_stalled', filters.stalled);
  }
  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  if (filters.from) {
    query = query.gte('score_date', filters.from);
  }
  if (filters.to) {
    query = query.lte('score_date', filters.to);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch account scores: ${error.message}`);
  }

  return data ?? [];
}
