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
}

export type SourceFieldsByObject = Record<string, SourceFieldOption[]>;

// --- Dimension / Value Mapping ---

export interface ValueMapEntry {
  source_value: string;
  target_value: string;
}

export interface DimensionMappingConfig {
  dimension: string;         // 'market' | 'motion'
  label: string;
  description: string;
  allowed_values: { value: string; label: string }[];
  suggested_source_field?: string;
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

// --- Stage Mapping ---

export interface StageMappingRow {
  source_stage_id: string;
  source_stage_label: string;
  funnel_stage: string;
}
