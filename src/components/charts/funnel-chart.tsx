'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface FunnelChartProps {
  data: Record<string, string | number>[];
  /** Bar keys to render (e.g. market codes). Extracted from data if omitted. */
  bars?: { key: string; label: string; color: string }[];
}

const DEFAULT_COLORS = ['#1d4ed8', '#7c3aed', '#059669', '#d97706', '#dc2626'];

function formatStageLabel(stage: string): string {
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FunnelChart({ data, bars }: FunnelChartProps) {
  // Auto-detect bar keys if not provided: all keys except 'stage' and 'name'
  const resolvedBars = bars ?? (() => {
    const keys = new Set<string>();
    for (const row of data) {
      for (const k of Object.keys(row)) {
        if (k !== 'stage' && k !== 'name' && typeof row[k] === 'number') {
          keys.add(k);
        }
      }
    }
    return [...keys].map((k, i) => ({
      key: k,
      label: formatStageLabel(k),
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));
  })();

  const formatted = data.map((d) => ({
    ...d,
    name: d.name ?? (typeof d.stage === 'string' ? formatStageLabel(d.stage) : ''),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formatted} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {resolvedBars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.label}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
