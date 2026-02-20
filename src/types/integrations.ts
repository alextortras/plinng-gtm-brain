// ============================================================
// Integration UI/API types for Plinng GTM Brain
// These are presentation-layer types, separate from DB row types
// ============================================================

import type { IntegrationProvider, IntegrationAuthType, IntegrationStatus, FieldMappingStatus } from './database';

// --- Catalog ---

export type IntegrationCategory = 'crm' | 'product_analytics' | 'advertising';

export interface IntegrationFeature {
  label: string;
}

export interface IntegrationCatalogEntry {
  provider: IntegrationProvider;
  name: string;
  description: string;
  category: IntegrationCategory;
  auth_type: IntegrationAuthType;
  icon: string; // Lucide icon name
  features: IntegrationFeature[];
}

// --- Grid page (catalog + DB status merged) ---

export interface IntegrationWithStatus extends IntegrationCatalogEntry {
  status: IntegrationStatus;
  account_name: string | null;
  connected_at: string | null;
  error_message: string | null;
  last_sync_at: string | null;
  last_sync_errors: number;
  integration_id: string | null;
}

// --- Field Mapping ---

export interface FieldMappingRow {
  id: string;
  source_object: string;
  source_field: string;
  target_table: string;
  target_field: string;
  status: FieldMappingStatus;
  transform_rule: Record<string, unknown> | null;
}

export interface FieldMappingGroup {
  source_object: string;
  mappings: FieldMappingRow[];
  total: number;
  mapped: number;
  completeness: number; // 0-100
}

export interface TargetFieldOption {
  table: string;
  field: string;
  label: string;
  description: string;
}

// --- Source Fields (from provider /fields endpoint) ---

export interface SourceFieldOption {
  name: string;
  label: string;
  type: string; // 'enumeration' | 'date' | 'number' | 'string' etc.
  options?: { value: string; label: string }[];
}

export type SourceFieldsByObject = Record<string, SourceFieldOption[]>;

// --- Dimension Mapping ---

export interface DimensionMappingConfig {
  dimension: string;         // 'market' | 'channel' | 'motion'
  label: string;
  description: string;
  required: boolean;
}

// --- HubSpot-specific ---

export interface HubSpotPipelineStage {
  id: string;
  label: string;
  display_order: number;
}

// --- Sync History ---

export interface SyncHistoryEntry {
  id: string;
  status: 'running' | 'success' | 'error';
  started_at: string;
  completed_at: string | null;
  records_synced: number;
  records_failed: number;
  error_details: string | null;
  duration_ms: number | null;
}

