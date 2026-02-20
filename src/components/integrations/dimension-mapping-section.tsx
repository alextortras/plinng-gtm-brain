'use client';

import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import type { SourceFieldOption } from '@/types/integrations';

interface DimensionMappingSectionProps {
  label: string;
  description: string;
  required: boolean;
  sourceFields: SourceFieldOption[];
  selectedSourceField: string;
  onSourceFieldChange: (field: string) => void;
  providerLabel?: string;
}

export function DimensionMappingSection({
  label,
  description,
  required,
  sourceFields,
  selectedSourceField,
  onSourceFieldChange,
  providerLabel = 'Source',
}: DimensionMappingSectionProps) {
  const enumFields = sourceFields.filter((f) => f.type === 'enumeration');
  const fieldOptions = enumFields.map((f) => ({ value: f.name, label: f.label }));

  const selectedField = enumFields.find((f) => f.name === selectedSourceField);
  const fieldValues = selectedField?.options ?? [];

  const isMapped = !!selectedSourceField;
  const statusLabel = isMapped ? 'Mapped' : required ? 'Required' : 'Optional';
  const statusVariant = isMapped ? ('low' as const) : required ? ('outline' as const) : ('outline' as const);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{description}</p>

      {/* Property selector */}
      <div className="flex items-center gap-4">
        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">{providerLabel} property:</label>
        <div className="min-w-[280px]">
          <Select
            options={fieldOptions}
            placeholder={`Select ${label.toLowerCase()} field...`}
            value={selectedSourceField}
            onChange={(e) => onSourceFieldChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {/* Read-only value preview */}
      {selectedSourceField && fieldValues.length > 0 && (
        <div className="ml-4 border-l-2 border-border pl-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Values found in &quot;{selectedField?.label}&quot;:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {fieldValues.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedSourceField && fieldValues.length === 0 && (
        <div className="ml-4 border-l-2 border-border pl-4">
          <p className="text-xs text-muted-foreground">
            No predefined values found for this field. Values will be read directly from your data.
          </p>
        </div>
      )}
    </div>
  );
}
