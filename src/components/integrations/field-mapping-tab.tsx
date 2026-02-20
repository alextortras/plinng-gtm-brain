'use client';

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { DateFieldSection } from '@/components/integrations/date-field-section';
import { DimensionMappingSection } from '@/components/integrations/dimension-mapping-section';
import { DIMENSION_CONFIGS } from '@/lib/integrations/target-fields';
import type { IntegrationFieldMapping } from '@/types/database';
import type { SourceFieldOption, SourceFieldsByObject } from '@/types/integrations';

interface FieldMappingTabProps {
  provider: string;
  mappings: IntegrationFieldMapping[];
  sourceFields: SourceFieldsByObject;
  onSave: (mappings: IntegrationFieldMapping[]) => void;
  saving?: boolean;
}

const PROVIDER_LABELS: Record<string, string> = {
  hubspot: 'HubSpot',
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
};

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

export function FieldMappingTab({
  provider,
  mappings,
  sourceFields,
  onSave,
  saving,
}: FieldMappingTabProps) {
  const allSourceFields = useMemo(() => flattenSourceFields(sourceFields), [sourceFields]);
  const providerLabel = PROVIDER_LABELS[provider] ?? provider;

  // --- Date state ---
  const existingDateMapping = extractDateMapping(mappings);
  const [dateField, setDateField] = useState(existingDateMapping?.source_field ?? '');

  // --- Dimension states (funnel_stage, market, channel, motion) ---
  const [dimensionState, setDimensionState] = useState<
    Record<string, { sourceField: string }>
  >(() => {
    const state: Record<string, { sourceField: string }> = {};
    for (const config of DIMENSION_CONFIGS) {
      const existing = extractDimensionMapping(mappings, config.dimension);
      state[config.dimension] = {
        sourceField: existing?.source_field ?? '',
      };
    }
    return state;
  });

  // --- Completeness checks ---
  const hasDate = !!dateField;
  const hasFunnelStage = !!dimensionState.funnel_stage?.sourceField;
  const hasMarket = !!dimensionState.market?.sourceField;
  const hasChannel = !!dimensionState.channel?.sourceField;
  const hasMotion = !!dimensionState.motion?.sourceField;

  const sections = [
    { key: 'date', label: 'Date', done: hasDate, required: true },
    { key: 'funnel_stage', label: 'Funnel Stage', done: hasFunnelStage, required: true },
    { key: 'market', label: 'Market', done: hasMarket, required: true },
    { key: 'channel', label: 'Channel', done: hasChannel, required: true },
    { key: 'motion', label: 'Motion', done: hasMotion, required: false },
  ];
  const requiredSections = sections.filter((s) => s.required);
  const configuredCount = sections.filter((d) => d.done).length;
  const requiredConfiguredCount = requiredSections.filter((d) => d.done).length;

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

    // Dimension mappings (funnel_stage, market, channel, motion)
    for (const config of DIMENSION_CONFIGS) {
      const state = dimensionState[config.dimension];
      if (!state?.sourceField) continue;
      const existing = extractDimensionMapping(mappings, config.dimension);
      result.push({
        id: existing?.id ?? `fm-${config.dimension}-${Date.now()}`,
        integration_id: integrationId,
        source_object: 'deals',
        source_field: state.sourceField,
        target_table: 'daily_funnel_metrics',
        target_field: config.dimension,
        status: 'mapped',
        transform_rule: { type: 'passthrough' },
        created_at: existing?.created_at ?? now,
        updated_at: now,
      });
    }

    return result;
  }, [dateField, dimensionState, mappings, existingDateMapping]);

  const handleSaveAll = () => {
    onSave(buildAllMappings());
  };

  const updateDimensionSourceField = (dimension: string, field: string) => {
    setDimensionState((prev) => ({
      ...prev,
      [dimension]: { sourceField: field },
    }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Completeness indicator */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {requiredConfiguredCount} of {requiredSections.length} required sections configured
          {hasMotion ? ` (+1 optional)` : ''}
        </p>
        <div className="flex flex-wrap gap-3">
          {sections.map((d) => (
            <div key={d.key} className="flex items-center gap-1.5 text-xs">
              {d.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={d.done ? 'text-foreground' : 'text-muted-foreground'}>
                {d.label}
                {!d.required && ' (optional)'}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(configuredCount / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section 1: Date Field */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            {hasDate ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            ) : (
              <Badge variant="outline" className="h-6 w-6 justify-center rounded-full p-0 text-xs font-semibold">1</Badge>
            )}
            <h3 className="text-sm font-semibold">Date Field</h3>
          </div>
          <p className="text-xs text-muted-foreground">Select the source date field used for daily metric aggregation.</p>
          <DateFieldSection
            sourceFields={allSourceFields}
            selectedField={dateField}
            onChange={setDateField}
          />
        </CardContent>
      </Card>

      {/* Sections 2-5: Funnel Stage, Market, Channel, Motion Dimensions */}
      {DIMENSION_CONFIGS.map((config, idx) => {
        const isDone = !!dimensionState[config.dimension]?.sourceField;
        return (
          <Card key={config.dimension}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                {isDone ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <Badge variant="outline" className="h-6 w-6 justify-center rounded-full p-0 text-xs font-semibold">
                    {idx + 2}
                  </Badge>
                )}
                <h3 className="text-sm font-semibold">{config.label}</h3>
                <Badge variant={isDone ? 'low' : 'outline'}>
                  {isDone ? 'Mapped' : config.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
              <DimensionMappingSection
                label={config.label}
                description={config.description}
                required={config.required}
                sourceFields={allSourceFields}
                selectedSourceField={dimensionState[config.dimension]?.sourceField ?? ''}
                onSourceFieldChange={(field) => updateDimensionSourceField(config.dimension, field)}
                providerLabel={providerLabel}
              />
            </CardContent>
          </Card>
        );
      })}

      {/* Sticky Save All button */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {configuredCount} of {sections.length} sections configured
          </span>
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Mappings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
