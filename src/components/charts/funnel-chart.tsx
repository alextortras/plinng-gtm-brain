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
  data: { stage: string; us: number; spain: number }[];
}

const STAGE_LABELS: Record<string, string> = {
  awareness: 'Awareness',
  education: 'Education',
  selection: 'Selection',
  commit: 'Commit',
  onboarding: 'Onboarding',
  impact: 'Impact',
  growth: 'Growth',
  advocacy: 'Advocacy',
};

export function FunnelChart({ data }: FunnelChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    name: STAGE_LABELS[d.stage] ?? d.stage,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formatted} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="us" name="US" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="spain" name="Spain" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
