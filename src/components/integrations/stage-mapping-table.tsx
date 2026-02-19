'use client';

import { Select } from '@/components/ui/select';
import { SLG_FUNNEL_STAGES } from '@/lib/integrations/target-fields';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import type { StageMappingRow } from '@/types/integrations';

const stageOptions = [
  { value: '', label: 'Select stage...' },
  ...SLG_FUNNEL_STAGES.map((s) => ({ value: s.value, label: s.label })),
];

interface StageMappingTableProps {
  stages: StageMappingRow[];
  onChange: (stages: StageMappingRow[]) => void;
}

export function StageMappingTable({ stages, onChange }: StageMappingTableProps) {
  // Check for unmapped or duplicated funnel stages
  const mappedStages = stages
    .map((s) => s.funnel_stage)
    .filter((s) => s !== '');
  const duplicates = mappedStages.filter(
    (s, i) => mappedStages.indexOf(s) !== i
  );
  const unmappedStages = SLG_FUNNEL_STAGES.filter(
    (bs) => !mappedStages.includes(bs.value)
  );

  const updateStage = (sourceStageId: string, funnelStage: string) => {
    onChange(
      stages.map((s) =>
        s.source_stage_id === sourceStageId
          ? { ...s, funnel_stage: funnelStage }
          : s
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Lifecycle Stage</th>
              <th className="w-8 px-2 py-2" />
              <th className="px-4 py-2 font-medium">Funnel Stage</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.source_stage_id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 text-sm">{stage.source_stage_label}</td>
                <td className="px-2 py-2.5 text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                </td>
                <td className="px-4 py-2.5">
                  <Select
                    options={stageOptions}
                    value={stage.funnel_stage}
                    onChange={(e) => updateStage(stage.source_stage_id, e.target.value)}
                    className="h-8 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warnings */}
      {unmappedStages.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            Unmapped funnel stages: {unmappedStages.map((s) => s.label).join(', ')}
          </span>
        </div>
      )}

      {duplicates.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            Duplicate mappings: {[...new Set(duplicates)].join(', ')}
          </span>
        </div>
      )}

      {stages.length === 0 && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No lifecycle stages available. Connect HubSpot to fetch lifecycle stages.
        </div>
      )}
    </div>
  );
}
