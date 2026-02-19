// ============================================================
// Supabase CRUD for integrations, field mappings, and sync history
// Follows the same pattern as queries/strategy-config.ts
// ============================================================

import { createClient } from '@/lib/supabase/server';
import type {
  Database,
  Integration,
  IntegrationFieldMapping,
  IntegrationSync,
  IntegrationProvider,
} from '@/types/database';

// --- Integrations ---

export async function getIntegrations(): Promise<Integration[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch integrations: ${error.message}`);
  }

  return data ?? [];
}

export async function getIntegrationByProvider(
  provider: IntegrationProvider
): Promise<Integration | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', provider)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch integration: ${error.message}`);
  }

  return data;
}

type IntegrationInsert = Database['public']['Tables']['integrations']['Insert'];
type IntegrationUpdate = Database['public']['Tables']['integrations']['Update'];

export async function upsertIntegration(
  data: IntegrationInsert & { id?: string }
): Promise<Integration> {
  const supabase = await createClient();

  const { data: result, error } = await (supabase.from('integrations') as ReturnType<typeof supabase.from>)
    .upsert(data as never, { onConflict: 'provider' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert integration: ${error.message}`);
  }

  return result;
}

export async function updateIntegration(
  id: string,
  updates: IntegrationUpdate
): Promise<Integration> {
  const supabase = await createClient();

  const { data, error } = await (supabase.from('integrations') as ReturnType<typeof supabase.from>)
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update integration: ${error.message}`);
  }

  return data;
}

export async function deleteIntegration(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete integration: ${error.message}`);
  }
}

// --- Field Mappings ---

export async function getFieldMappings(
  integrationId: string
): Promise<IntegrationFieldMapping[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('integration_field_mappings')
    .select('*')
    .eq('integration_id', integrationId)
    .order('source_object', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch field mappings: ${error.message}`);
  }

  return data ?? [];
}

type FieldMappingInsert = Database['public']['Tables']['integration_field_mappings']['Insert'];

export async function upsertFieldMappings(
  mappings: FieldMappingInsert[]
): Promise<IntegrationFieldMapping[]> {
  if (mappings.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await (supabase.from('integration_field_mappings') as ReturnType<typeof supabase.from>)
    .upsert(mappings as never)
    .select();

  if (error) {
    throw new Error(`Failed to upsert field mappings: ${error.message}`);
  }

  return data ?? [];
}

// --- Sync History ---

export async function getSyncHistory(
  integrationId: string,
  limit = 20
): Promise<IntegrationSync[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('integration_syncs')
    .select('*')
    .eq('integration_id', integrationId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch sync history: ${error.message}`);
  }

  return data ?? [];
}

export async function getLatestSync(
  integrationId: string
): Promise<IntegrationSync | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('integration_syncs')
    .select('*')
    .eq('integration_id', integrationId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest sync: ${error.message}`);
  }

  return data;
}

type SyncInsert = Database['public']['Tables']['integration_syncs']['Insert'];

export async function createSyncRecord(
  sync: SyncInsert
): Promise<IntegrationSync> {
  const supabase = await createClient();

  const { data, error } = await (supabase.from('integration_syncs') as ReturnType<typeof supabase.from>)
    .insert(sync as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create sync record: ${error.message}`);
  }

  return data;
}
