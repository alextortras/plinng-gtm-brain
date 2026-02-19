'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { FunnelConfig, PeriodType } from '@/lib/funnel-config';
import type { PhaseTableData } from '@/lib/mock-data';

type ChartType = 'line' | 'bar' | 'area';

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'area', label: 'Area' },
];

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const COLORS = ['#1d4ed8', '#7c3aed'];

function formatTickValue(value: number, format: 'number' | 'currency' | 'percent'): string {
  if (format === 'currency') {
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value.toFixed(0)}`;
  }
  if (format === 'percent') {
    return (value * 100).toFixed(0) + '%';
  }
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toFixed(0);
}

interface PhaseMetricsChartProps {
  config: FunnelConfig;
  data: PhaseTableData;
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function PhaseMetricsChart({
  config,
  data,
  period,
  onPeriodChange,
}: PhaseMetricsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [metric1, setMetric1] = useState<string>(() => config.rows[0]?.key ?? '');
  const [metric2, setMetric2] = useState<string>('');

  // Reset selection when config changes (phase/motion switch)
  const configKey = config.rows.map((r) => r.key).join(',');
  const [prevConfigKey, setPrevConfigKey] = useState(configKey);
  if (configKey !== prevConfigKey) {
    setPrevConfigKey(configKey);
    setMetric1(config.rows[0]?.key ?? '');
    setMetric2('');
  }

  const selected = useMemo(() => {
    const keys: string[] = [];
    if (metric1) keys.push(metric1);
    if (metric2) keys.push(metric2);
    return keys;
  }, [metric1, metric2]);

  const selectedRows = useMemo(
    () => selected.map((key) => config.rows.find((r) => r.key === key)).filter((r): r is NonNullable<typeof r> => r != null),
    [selected, config.rows]
  );

  const chartData = useMemo(() => {
    return data.columns.map((col) => {
      const point: Record<string, string | number> = { period: col };
      for (const key of selected) {
        point[key] = data.values[key]?.[col] ?? 0;
      }
      return point;
    });
  }, [data, selected]);

  const needsDualAxis = selectedRows.length === 2 && selectedRows[0]!.format !== selectedRows[1]!.format;

  return (
    <div>
      {/* Controls row */}
      <div className="mb-4 flex flex-wrap items-end gap-4">
        {/* Metric 1 */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Metric 1
          </label>
          <select
            value={metric1}
            onChange={(e) => {
              const val = e.target.value;
              setMetric1(val);
              // If user picks the same as metric2, clear metric2
              if (val === metric2) setMetric2('');
            }}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {config.rows.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Metric 2 (optional) */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Metric 2
          </label>
          <select
            value={metric2}
            onChange={(e) => setMetric2(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">None</option>
            {config.rows
              .filter((r) => r.key !== metric1)
              .map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
          </select>
        </div>

        {/* Chart type */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Chart</p>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {CHART_TYPES.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setChartType(ct.value)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-medium transition-colors',
                  chartType === ct.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Period</p>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  period === p.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        {renderChart(chartType, chartData, selectedRows, needsDualAxis)}
      </ResponsiveContainer>
    </div>
  );
}

function renderChart(
  chartType: ChartType,
  chartData: Record<string, string | number>[],
  selectedRows: { key: string; label: string; format: 'number' | 'currency' | 'percent' }[],
  needsDualAxis: boolean,
) {
  const commonProps = {
    data: chartData,
    margin: { top: 10, right: needsDualAxis ? 60 : 30, left: 0, bottom: 0 },
  };

  const xAxis = <XAxis dataKey="period" tick={{ fontSize: 12 }} />;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />;
  const tooltip = <Tooltip />;
  const legend = <Legend />;

  const yAxes = selectedRows.map((row, i) => (
    <YAxis
      key={row.key}
      yAxisId={needsDualAxis ? `y${i}` : 'y0'}
      orientation={i === 0 ? 'left' : 'right'}
      tick={{ fontSize: 12 }}
      tickFormatter={(v: number) => formatTickValue(v, row.format)}
      hide={needsDualAxis ? false : i > 0}
    />
  ));

  if (chartType === 'line') {
    return (
      <LineChart {...commonProps}>
        {grid}
        {xAxis}
        {yAxes}
        {tooltip}
        {legend}
        {selectedRows.map((row, i) => (
          <Line
            key={row.key}
            yAxisId={needsDualAxis ? `y${i}` : 'y0'}
            type="monotone"
            dataKey={row.key}
            name={row.label}
            stroke={COLORS[i]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    );
  }

  if (chartType === 'area') {
    return (
      <AreaChart {...commonProps}>
        {grid}
        {xAxis}
        {yAxes}
        {tooltip}
        {legend}
        {selectedRows.map((row, i) => (
          <Area
            key={row.key}
            yAxisId={needsDualAxis ? `y${i}` : 'y0'}
            type="monotone"
            dataKey={row.key}
            name={row.label}
            stroke={COLORS[i]}
            fill={COLORS[i]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    );
  }

  // Default: bar
  return (
    <BarChart {...commonProps}>
      {grid}
      {xAxis}
      {yAxes}
      {tooltip}
      {legend}
      {selectedRows.map((row, i) => (
        <Bar
          key={row.key}
          yAxisId={needsDualAxis ? `y${i}` : 'y0'}
          dataKey={row.key}
          name={row.label}
          fill={COLORS[i]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  );
}
