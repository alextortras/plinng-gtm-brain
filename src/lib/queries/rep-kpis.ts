import { createClient } from '@/lib/supabase/server';
import { RepKpi, RepRole } from '@/types/database';

export interface RepKpisFilters {
  role?: RepRole;
  from?: string;
  to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

export async function getRepKpis(
  filters: RepKpisFilters = {}
): Promise<RepKpi[]> {
  const supabase = await createClient();

  let query = supabase.from('rep_kpis').select('*');

  if (filters.role) {
    query = query.eq('rep_role', filters.role);
  }
  if (filters.from) {
    query = query.gte('date', filters.from);
  }
  if (filters.to) {
    query = query.lte('date', filters.to);
  }

  const sortColumn = filters.sort ?? 'date';
  const sortOrder = filters.order === 'asc';
  query = query.order(sortColumn, { ascending: sortOrder });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch rep KPIs: ${error.message}`);
  }

  return data ?? [];
}
