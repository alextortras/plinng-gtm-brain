'use client';

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import { StageMappingTable } from '@/components/integrations/stage-mapping-table';
import { DateFieldSection } from '@/components/integrations/date-field-section';
import { DimensionMappingSection } from '@/components/integrations/dimension-mapping-section';
import { FieldMappingTable } from '@/components/integrations/field-mapping-table';
import {
  DIMENSION_CONFIGS,
  METRIC_TARGET_FIELDS,
  HUBSPOT_MOTION_SUGGESTIONS,
  HUBSPOT_MARKET_SUGGESTIONS,
} from '@/lib/integrations/target-fields';
import type { IntegrationFieldMapping } from '@/types/database';
import type { StageMappingRow, SourceFieldOption, SourceFieldsByObject, ValueMapEntry } from '@/types/integrations';

interface FieldMappingTabProps {
  provider: string;
  mappings: IntegrationFieldMapping[];
  sourceFields: SourceFieldsByObject;
  stageMappings: StageMappingRow[];
  onStageMappingsChange: (stages: StageMappingRow[]) => void;
  onSave: (mappings: IntegrationFieldMapping[]) => void;
  saving?: boolean;
}

// Flatten all source fields from all objects into a single list
function flattenSourceFields(sourceFields: SourceFieldsByObject): SourceFieldOption[] {
  const seen = new Set<string>();
  const result: SourceFieldOption[] = [];
  for (const fields of Object.values(sourceFields)) {
    for (const f of fields) {
      if (!seen.has(f.name)) {
        seen.add(f.name);
        result.push(f);
      }
    }
  }
  return result;
}

// Extract state from existing mappings
function extractDateMapping(mappings: IntegrationFieldMapping[]) {
  return mappings.find(
    (m) => m.target_table === 'daily_funnel_metrics' && m.target_field === 'date'
  );
}

function extractDimensionMapping(mappings: IntegrationFieldMapping[], dimension: string) {
  return mappings.find(
    (m) => m.target_table === 'daily_funnel_metrics' && m.target_field === dimension
  );
}

function extractValueMap(mapping: IntegrationFieldMapping | undefined): ValueMapEntry[] {
  if (!mapping?.transform_rule) return [];
  const rule = mapping.transform_rule as { type?: string; value_map?: Record<string, string> };
  if (rule.type !== 'value_map' || !rule.value_map) return [];
  return Object.entries(rule.value_map).map(([source_value, target_value]) => ({
    source_value,
    target_value,
  }));
}

// Get metric-only mappings (exclude date, market, motion, funnel_stage)
const DIMENSION_FIELDS = new Set(['date', 'market', 'motion', 'funnel_stage']);
function getMetricMappings(mappings: IntegrationFieldMapping[]): IntegrationFieldMapping[] {
  return mappings.filter(
    (m) => !(m.target_table === 'daily_funnel_metrics' && DIMENSION_FIELDS.has(m.target_field))
  );
}

const SUGGESTIONS_MAP: Record<string, Record<string, string>> = {
  motion: HUBSPOT_MOTION_SUGGESTIONS,
  market: HUBSPOT_MARKET_SUGGESTIONS,
};

export function FieldMappingTab({
  provider,
  mappings,
  sourceFields,
  stageMappings,
  onStageMappingsChange,
  onSave,
  saving,
}: FieldMappingTabProps) {
  const allSourceFields = useMemo(() => flattenSourceFields(sourceFields), [sourceFields]);

  // --- Date state ---
  const existingDateMapping = extractDateMapping(mappings);
  const [dateField, setDateField] = useState(existingDateMapping?.source_field ?? '');

  // --- Dimension states (market, motion) ---
  const [dimensionState, setDimensionState] = useState<
    Record<string, { sourceField: string; valueMap: ValueMapEntry[] }>
  >(() => {
    const state: Record<string, { sourceField: string; valueMap: ValueMapEntry[] }> = {};
    for (const config of DIMENSION_CONFIGS) {
      const existing = extractDimensionMapping(mappings, config.dimension);
      state[config.dimension] = {
        sourceField: existing?.source_field ?? '',
        valueMap: extractValueMap(existing),
      };
    }
    return state;
  });

  // --- Metric mappings ---
  const [metricMappings, setMetricMappings] = useState<IntegrationFieldMapping[]>(
    getMetricMappings(mappings)
  );

  // --- Completeness checks ---
  const hasStages = stageMappings.some((s) => s.funnel_stage !== '');
  const hasDate = !!dateField;
  const hasMarket = !!dimensionState.market?.sourceField && dimensionState.market.valueMap.some((e) => e.target_value);
  const hasMotion = !!dimensionState.motion?.sourceField && dimensionState.motion.valueMap.some((e) => e.target_value);

  const dimensions = [
    { key: 'stages', label: 'Stages', done: hasStages },
    { key: 'date', label: 'Date', done: hasDate },
    { key: 'market', label: 'Market', done: hasMarket },
    { key: 'motion', label: 'Motion', done: hasMotion },
  ];
  const configuredCount = dimensions.filter((d) => d.done).length;

  // --- Build all mappings for save ---
  const buildAllMappings = useCallback((): IntegrationFieldMapping[] => {
    const now = new Date().toISOString();
    const integrationId = mappings[0]?.integration_id ?? '';
    const result: IntegrationFieldMapping[] = [];

    // Date mapping
    if (dateField) {
      result.push({
        id: existingDateMapping?.id ?? `fm-date-${Date.now()}`,
        integration_id: integrationId,
        source_object: 'deals',
        source_field: dateField,
        target_table: 'daily_funnel_metrics',
        target_field: 'date',
        status: 'mapped',
        transform_rule: { type: 'date_extract' },
        created_at: existingDateMapping?.created_at ?? now,
        updated_at: now,
      });
    }

    // Dimension mappings (market, motion)
    for (const config of DIMENSION_CONFIGS) {
      const state = dimensionState[config.dimension];
      if (!state?.sourceField) continue;
      const existing = extractDimensionMapping(mappings, config.dimension);
      const valueMapObj: Record<string, string> = {};
      for (const entry of state.valueMap) {
        if (entry.target_value) {
          valueMapObj[entry.source_value] = entry.target_value;
        }
      }
      result.push({
        id: existing?.id ?? `fm-${config.dimension}-${Date.now()}`,
        integration_id: integrationId,
        source_object: 'deals',
        source_field: state.sourceField,
        target_table: 'daily_funnel_metrics',
        target_field: config.dimension,
        status: Object.keys(valueMapObj).length > 0 ? 'mapped' : 'suggested',
        transform_rule: Object.keys(valueMapObj).length > 0
          ? { type: 'value_map', value_map: valueMapObj }
          : null,
        created_at: existing?.created_at ?? now,
        updated_at: now,
      });
    }

    // Stage mapping (funnel_stage) — keep existing
    const stageMapping = mappings.find(
      (m) => m.target_table === 'daily_funnel_metrics' && m.target_field === 'funnel_stage'
    );
    if (stageMapping) {
      result.push(stageMapping);
    }

    // Metric mappings
    result.push(...metricMappings);

    return result;
  }, [dateField, dimensionState, metricMappings, mappings, existingDateMapping]);

  const handleSaveAll = () => {
    onSave(buildAllMappings());
  };

  const updateDimensionSourceField = (dimension: string, field: string) => {
    setDimensionState((prev) => ({
      ...prev,
      [dimension]: { ...prev[dimension], sourceField: field },
    }));
  };

  const updateDimensionValueMap = (dimension: string, entries: ValueMapEntry[]) => {
    setDimensionState((prev) => ({
      ...prev,
      [dimension]: { ...prev[dimension], valueMap: entries },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Completeness indicator */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {configuredCount} of {dimensions.length} required dimensions configured
        </p>
        <div className="flex flex-wrap gap-3">
          {dimensions.map((d) => (
            <div key={d.key} className="flex items-center gap-1.5 text-xs">
              {d.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={d.done ? 'text-foreground' : 'text-muted-foreground'}>{d.label}</span>
            </div>
          ))}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(configuredCount / dimensions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section 1: Lifecycle Stage Mapping */}
      {provider === 'hubspot' && stageMappings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-6 w-6 justify-center rounded-full p-0 text-xs font-semibold">1</Badge>
            <h3 className="text-sm font-semibold">Lifecycle Stage Mapping</h3>
            <Badge variant={hasStages ? 'low' : 'outline'}>
              {hasStages ? 'Configured' : 'Required'}
            </Badge>
          </div>
          <StageMappingTable
            stages={stageMappings}
            onChange={onStageMappingsChange}
          />
        </section>
      )}

      {/* Section 2: Date Field */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-6 w-6 justify-center rounded-full p-0 text-xs font-semibold">2</Badge>
          <h3 className="text-sm font-semibold">Date Field</h3>
        </div>
        <p className="text-xs text-muted-foreground">Select the source date field used for daily metric aggregation.</p>
        <DateFieldSection
          sourceFields={allSourceFields}
          selectedField={dateField}
          onChange={setDateField}
        />
      </section>

      {/* Section 3 & 4: Market & Motion Dimensions */}
      {DIMENSION_CONFIGS.map((config, idx) => (
        <section key={config.dimension} className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-6 w-6 justify-center rounded-full p-0 text-xs font-semibold">
              {idx + 3}
            </Badge>
            <h3 className="text-sm font-semibold">{config.label}</h3>
          </div>
          <DimensionMappingSection
            label={config.label}
            description={config.description}
            allowedValues={config.allowed_values}
            sourceFields={allSourceFields}
            selectedSourceField={dimensionState[config.dimension]?.sourceField ?? ''}
            onSourceFieldChange={(field) => updateDimensionSourceField(config.dimension, field)}
            valueMap={dimensionState[config.dimension]?.valueMap ?? []}
            onValueMapChange={(entries) => updateDimensionValueMap(config.dimension, entries)}
            suggestions={SUGGESTIONS_MAP[config.dimension]}
          />
        </section>
      ))}

      {/* Section 5: Metric Fields */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-6 w-6 justify-center rounded-full p-0 text-xs font-semibold">5</Badge>
          <h3 className="text-sm font-semibold">Metric Fields</h3>
        </div>
        <p className="text-xs text-muted-foreground">Map source fields to GTM Brain numeric metrics (revenue, spend, CAC, etc.).</p>
        <FieldMappingTable
          mappings={metricMappings}
          onSave={setMetricMappings}
          targetFieldFilter={METRIC_TARGET_FIELDS}
        />
      </section>

      {/* Save All button */}
      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Mappings'}
        </Button>
      </div>
    </div>
  );
}
