'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { FunnelConfig, FunnelRow, PeriodType } from '@/lib/funnel-config';
import type { PhaseTableData } from '@/lib/mock-data';

const GROUP_LABELS: Record<string, string> = {
  volume: 'Volume',
  conversion: 'Conversions',
  cost: 'Unit Economics',
  customers: 'Customers',
  rates: 'Rates',
  growth: 'Growth',
  contraction: 'Contraction',
  summary: 'Summary',
};

function formatValue(value: number, format: 'number' | 'currency' | 'percent'): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === 'percent') {
    return (value * 100).toFixed(1) + '%';
  }
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function computeSummary(row: FunnelRow, vals: Record<string, number>): number {
  const entries = Object.values(vals);
  if (entries.length === 0) return 0;
  const total = entries.reduce((s, v) => s + v, 0);
  return (row.summary === 'avg') ? total / entries.length : total;
}

function getTrend(vals: Record<string, number>, columns: string[]): 'up' | 'down' | 'flat' {
  if (columns.length < 2) return 'flat';
  const curr = vals[columns[columns.length - 1]] ?? 0;
  const prev = vals[columns[columns.length - 2]] ?? 0;
  if (curr > prev * 1.005) return 'up';
  if (curr < prev * 0.995) return 'down';
  return 'flat';
}

interface PhaseMetricsTableProps {
  config: FunnelConfig;
  data: PhaseTableData;
}

export function PhaseMetricsTable({
  config,
  data,
}: PhaseMetricsTableProps) {

  // Collect unique groups in order
  const groups: string[] = [];
  for (const row of config.rows) {
    if (!groups.includes(row.group)) groups.push(row.group);
  }

  const colSpanTotal = data.columns.length + 3; // label + period cols + summary + trend

  // Determine if all rows are averaged, all summed, or mixed
  const allAvg = config.rows.every((r) => r.summary === 'avg');
  const allSum = config.rows.every((r) => !r.summary || r.summary === 'sum');
  const summaryLabel = allAvg ? 'Avg' : allSum ? 'Total' : 'Summary';

  const hasData = data.columns.length > 0;

  return (
    <div>
      {!hasData ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No data for the selected filters. Try adjusting the date range.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Metric
                </th>
                {data.columns.map((col) => (
                  <th
                    key={col}
                    className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
                <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap border-l border-border">
                  {summaryLabel}
                </th>
                <th className="py-2 w-8" />
              </tr>
            </thead>
            {groups.map((group) => {
              const groupRows = config.rows.filter((r) => r.group === group);
              const label = GROUP_LABELS[group] || group;
              return (
                <tbody key={group}>
                  {/* Group header */}
                  <tr>
                    <td
                      colSpan={colSpanTotal}
                      className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {label}
                    </td>
                  </tr>
                  {groupRows.map((row) => {
                    const vals = data.values[row.key] ?? {};
                    const summary = computeSummary(row, vals);
                    const trend = getTrend(vals, data.columns);

                    return (
                      <tr key={row.key}>
                        <td className="py-1.5 pr-4 font-medium whitespace-nowrap">
                          {row.label}
                        </td>
                        {data.columns.map((col) => (
                          <td
                            key={col}
                            className="py-1.5 px-3 text-right tabular-nums whitespace-nowrap"
                          >
                            {formatValue(vals[col] ?? 0, row.format)}
                          </td>
                        ))}
                        <td className="py-1.5 px-3 text-right tabular-nums whitespace-nowrap font-medium border-l border-border">
                          {formatValue(summary, row.format)}
                        </td>
                        <td className="py-1.5 pl-1 w-8 text-center">
                          {trend === 'up' && (
                            <TrendingUp className="inline h-3.5 w-3.5 text-urgency-low" aria-label="Trending up" />
                          )}
                          {trend === 'down' && (
                            <TrendingDown className="inline h-3.5 w-3.5 text-destructive" aria-label="Trending down" />
                          )}
                          {trend === 'flat' && (
                            <Minus className="inline h-3.5 w-3.5 text-muted-foreground" aria-label="Flat" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
        </div>
      )}
    </div>
  );
}
