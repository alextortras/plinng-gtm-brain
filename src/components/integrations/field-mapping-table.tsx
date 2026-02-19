'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TARGET_FIELDS } from '@/lib/integrations/target-fields';
import { ChevronDown, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import type { IntegrationFieldMapping } from '@/types/database';
import type { FieldMappingGroup, TargetFieldOption } from '@/types/integrations';

interface FieldMappingTableProps {
  mappings: IntegrationFieldMapping[];
  onSave: (mappings: IntegrationFieldMapping[]) => void;
  saving?: boolean;
  targetFieldFilter?: TargetFieldOption[];
}

function groupMappings(mappings: IntegrationFieldMapping[]): FieldMappingGroup[] {
  const grouped = new Map<string, IntegrationFieldMapping[]>();

  for (const m of mappings) {
    const existing = grouped.get(m.source_object) ?? [];
    existing.push(m);
    grouped.set(m.source_object, existing);
  }

  return Array.from(grouped.entries()).map(([source_object, items]) => {
    const mapped = items.filter((m) => m.status === 'mapped').length;
    return {
      source_object,
      mappings: items,
      total: items.length,
      mapped,
      completeness: items.length > 0 ? Math.round((mapped / items.length) * 100) : 0,
    };
  });
}

const STATUS_BADGE = {
  mapped: { label: 'Mapped', variant: 'low' as const },
  suggested: { label: 'Suggested', variant: 'medium' as const },
  unmapped: { label: 'Unmapped', variant: 'outline' as const },
};

export function FieldMappingTable({ mappings, onSave, saving, targetFieldFilter }: FieldMappingTableProps) {
  const targetFieldOptions = (targetFieldFilter ?? TARGET_FIELDS).map((f) => ({
    value: `${f.table}.${f.field}`,
    label: f.label,
  }));
  const [localMappings, setLocalMappings] = useState<IntegrationFieldMapping[]>(mappings);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const groups = groupMappings(localMappings);
  const totalMapped = localMappings.filter((m) => m.status === 'mapped').length;
  const totalRequired = localMappings.length;

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const updateMapping = (id: string, targetValue: string) => {
    setLocalMappings((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (!targetValue) {
          return { ...m, target_table: '', target_field: '', status: 'unmapped' };
        }
        const [table, field] = targetValue.split('.');
        return { ...m, target_table: table, target_field: field, status: 'mapped' };
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Completeness bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{totalMapped} of {totalRequired} fields mapped</span>
            <span>{totalRequired > 0 ? Math.round((totalMapped / totalRequired) * 100) : 0}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${totalRequired > 0 ? (totalMapped / totalRequired) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grouped mapping tables */}
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.source_object);

        return (
          <div key={group.source_object} className="rounded-lg border border-border">
            <button
              onClick={() => toggleGroup(group.source_object)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="capitalize">{group.source_object}</span>
                <span className="text-xs text-muted-foreground">
                  ({group.mapped}/{group.total} mapped)
                </span>
              </div>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${group.completeness}%` }}
                />
              </div>
            </button>

            {!isCollapsed && (
              <div className="border-t border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Source Field</th>
                      <th className="w-8 px-2 py-2" />
                      <th className="px-4 py-2 font-medium">Target Field</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.mappings.map((mapping) => {
                      const badge = STATUS_BADGE[mapping.status];
                      const currentValue = mapping.target_table && mapping.target_field
                        ? `${mapping.target_table}.${mapping.target_field}`
                        : '';

                      return (
                        <tr key={mapping.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <code className="text-sm">{mapping.source_field}</code>
                              {mapping.status === 'suggested' && (
                                <Sparkles className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-muted-foreground">
                            <ArrowRight className="h-3 w-3" />
                          </td>
                          <td className="px-4 py-2.5">
                            <Select
                              options={targetFieldOptions}
                              placeholder="Select target field..."
                              value={currentValue}
                              onChange={(e) => updateMapping(mapping.id, e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Save button */}
      {localMappings.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => onSave(localMappings)}
            disabled={saving}
            size="sm"
          >
            {saving ? 'Saving...' : 'Save Mappings'}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {localMappings.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No field mappings available. Connect the integration and fetch source fields first.
        </div>
      )}
    </div>
  );
}
