'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ArrowRight, Plus, X } from 'lucide-react';
import type { SourceFieldOption, ValueMapEntry } from '@/types/integrations';

interface DimensionMappingSectionProps {
  label: string;
  description: string;
  allowedValues: { value: string; label: string }[];
  sourceFields: SourceFieldOption[];
  selectedSourceField: string;
  onSourceFieldChange: (field: string) => void;
  valueMap: ValueMapEntry[];
  onValueMapChange: (entries: ValueMapEntry[]) => void;
  suggestions?: Record<string, string>;
}

export function DimensionMappingSection({
  label,
  description,
  allowedValues,
  sourceFields,
  selectedSourceField,
  onSourceFieldChange,
  valueMap,
  onValueMapChange,
  suggestions,
}: DimensionMappingSectionProps) {
  const [newSourceValue, setNewSourceValue] = useState('');

  const enumFields = sourceFields.filter((f) => f.type === 'enumeration');
  const fieldOptions = enumFields.map((f) => ({ value: f.name, label: f.label }));
  const targetOptions = allowedValues.map((v) => ({ value: v.value, label: v.label }));

  const mappedCount = valueMap.filter((e) => e.target_value).length;
  const totalCount = valueMap.length;
  const status: 'mapped' | 'partial' | 'unmapped' =
    totalCount === 0 || !selectedSourceField
      ? 'unmapped'
      : mappedCount === totalCount
        ? 'mapped'
        : 'partial';

  const statusBadge = {
    mapped: { label: 'Mapped', variant: 'low' as const },
    partial: { label: 'Partial', variant: 'medium' as const },
    unmapped: { label: 'Unmapped', variant: 'outline' as const },
  };

  const updateEntry = (index: number, targetValue: string) => {
    const next = [...valueMap];
    next[index] = { ...next[index], target_value: targetValue };
    onValueMapChange(next);
  };

  const removeEntry = (index: number) => {
    onValueMapChange(valueMap.filter((_, i) => i !== index));
  };

  const addCustomValue = () => {
    const trimmed = newSourceValue.trim();
    if (!trimmed || valueMap.some((e) => e.source_value === trimmed)) return;
    const suggestedTarget = suggestions?.[trimmed] ?? '';
    onValueMapChange([...valueMap, { source_value: trimmed, target_value: suggestedTarget }]);
    setNewSourceValue('');
  };

  const handleSourceFieldChange = (field: string) => {
    onSourceFieldChange(field);
    // When source field changes and we have suggestions, pre-fill value map
    if (field && suggestions && valueMap.length === 0) {
      const entries: ValueMapEntry[] = Object.entries(suggestions).map(([source, target]) => ({
        source_value: source,
        target_value: target,
      }));
      if (entries.length > 0) {
        onValueMapChange(entries);
      }
    }
  };

  const badge = statusBadge[status];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{description}</p>

      {/* Property selector */}
      <div className="flex items-center gap-4">
        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Source property:</label>
        <div className="w-64">
          <Select
            options={fieldOptions}
            placeholder={`Select ${label.toLowerCase()} field...`}
            value={selectedSourceField}
            onChange={(e) => handleSourceFieldChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Value mapping table */}
      {selectedSourceField && (
        <div className="rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Source Value</th>
                <th className="w-8 px-2 py-2" />
                <th className="px-4 py-2 font-medium">Target Value</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {valueMap.map((entry, index) => (
                <tr key={entry.source_value} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">
                    <code className="text-xs">{entry.source_value}</code>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                  </td>
                  <td className="px-4 py-2">
                    <Select
                      options={targetOptions}
                      placeholder="Select..."
                      value={entry.target_value}
                      onChange={(e) => updateEntry(index, e.target.value)}
                      className="h-7 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeEntry(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add custom value row */}
          <div className="flex items-center gap-2 border-t border-border px-4 py-2">
            <input
              type="text"
              placeholder="Add custom source value..."
              value={newSourceValue}
              onChange={(e) => setNewSourceValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomValue()}
              className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomValue}
              disabled={!newSourceValue.trim()}
              className="h-7 px-2 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
