'use client';

import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import type { SourceFieldOption } from '@/types/integrations';

interface DateFieldSectionProps {
  sourceFields: SourceFieldOption[];
  selectedField: string;
  onChange: (field: string) => void;
}

export function DateFieldSection({ sourceFields, selectedField, onChange }: DateFieldSectionProps) {
  const dateFields = sourceFields.filter((f) => f.type === 'date' || f.type === 'datetime');
  const isMapped = !!selectedField;

  const options = dateFields.map((f) => ({ value: f.name, label: f.label }));

  return (
    <div className="flex items-center gap-4">
      <div className="w-64">
        <Select
          options={options}
          placeholder="Select date field..."
          value={selectedField}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <Badge variant={isMapped ? 'low' : 'medium'}>
        {isMapped ? 'Mapped' : 'Required'}
      </Badge>
      {dateFields.length === 0 && (
        <span className="text-xs text-muted-foreground">No date fields available from source</span>
      )}
    </div>
  );
}
