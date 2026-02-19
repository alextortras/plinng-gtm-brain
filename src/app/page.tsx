'use client';

import { useState, useMemo } from 'react';
import { useApi } from '@/hooks/use-api';
import { KpiCard } from '@/components/kpi-card';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { PhaseMetricsTable } from '@/components/phase-metrics-table';
import { PhaseMetricsChart } from '@/components/phase-metrics-chart';
import { DailyFunnelMetric } from '@/types/database';
import {
  CHANNEL_OPTIONS,
  MOTION_TYPE_OPTIONS,
  CHANNEL_API_MAP,
  isPaidChannel,
  getPhaseFunnel,
  type PeriodType,
} from '@/lib/funnel-config';
import { generatePhaseTableData, generateAcquisitionKpis } from '@/lib/mock-data';

const PHASE_TABS = [
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'retention', label: 'Retention' },
  { value: 'expansion', label: 'Expansion' },
];

const VIEW_TABS = [
  { value: 'table', label: 'Table' },
  { value: 'graph', label: 'Graph' },
];

const PHASE_STAGES: Record<string, readonly string[]> = {
  acquisition: ['awareness', 'education', 'selection', 'commit'],
  retention: ['onboarding', 'impact'],
  expansion: ['growth', 'advocacy'],
};

const MARKET_OPTIONS = [
  { value: '', label: 'All Markets' },
  { value: 'us', label: 'United States' },
  { value: 'spain', label: 'Spain' },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}

function formatPercent(val: number): string {
  return (val * 100).toFixed(1) + '%';
}

function formatChange(val: number): { text: string; trend: 'up' | 'down' | 'neutral' } {
  const pct = (val * 100).toFixed(1) + '%';
  if (val > 0.005) return { text: '+' + pct, trend: 'up' };
  if (val < -0.005) return { text: pct, trend: 'down' };
  return { text: pct, trend: 'neutral' };
}

/** For CAC / Payback, lower is better — invert trend direction */
function formatChangeInverted(val: number): { text: string; trend: 'up' | 'down' | 'neutral' } {
  const pct = (val * 100).toFixed(1) + '%';
  if (val > 0.005) return { text: '+' + pct, trend: 'down' };
  if (val < -0.005) return { text: pct, trend: 'up' };
  return { text: pct, trend: 'neutral' };
}

function formatMonths(val: number): string {
  return val.toFixed(1) + ' mo';
}

function formatDays(val: number): string {
  return Math.round(val) + ' days';
}

export default function DashboardPage() {
  const [market, setMarket] = useState('');
  const [channel, setChannel] = useState('');
  const [motionType, setMotionType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [phase, setPhase] = useState('acquisition');
  const [view, setView] = useState('table');
  const [tablePeriod, setTablePeriod] = useState<PeriodType>('weekly');
  const [chartPeriod, setChartPeriod] = useState<PeriodType>('weekly');

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (market) p.market = market;
    if (channel) {
      p.motion = CHANNEL_API_MAP[channel] || channel;
    }
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [market, channel, from, to]);

  const { data: metrics, loading } = useApi<DailyFunnelMetric[]>(
    '/api/funnel-metrics',
    params
  );

  const phaseMetrics = useMemo(() => {
    if (!metrics) return [];
    const stages = PHASE_STAGES[phase] ?? [];
    return metrics.filter((m) => stages.includes(m.funnel_stage));
  }, [metrics, phase]);

  const kpis = useMemo(() => {
    if (phaseMetrics.length === 0) {
      return { totalRevenue: 0, totalPipeline: 0, blendedCac: 0, totalLeads: 0 };
    }

    const totalRevenue = phaseMetrics.reduce((s, m) => s + Number(m.revenue), 0);
    const totalPipeline = phaseMetrics.reduce((s, m) => s + Number(m.pipeline_value), 0);
    const totalSpend = phaseMetrics.reduce((s, m) => s + Number(m.spend), 0);
    const totalLeads = phaseMetrics.reduce((s, m) => s + m.leads_count, 0);
    const blendedCac = totalLeads > 0 ? totalSpend / totalLeads : 0;

    return { totalRevenue, totalPipeline, blendedCac, totalLeads };
  }, [phaseMetrics]);

  const paid = isPaidChannel(channel);

  const funnelConfig = useMemo(
    () => getPhaseFunnel(phase, channel, motionType),
    [phase, channel, motionType]
  );

  const acqKpis = useMemo(
    () => phase === 'acquisition'
      ? generateAcquisitionKpis(funnelConfig, phase, paid, from || undefined, to || undefined)
      : null,
    [funnelConfig, phase, paid, from, to]
  );

  const tableData = useMemo(
    () => generatePhaseTableData(funnelConfig, tablePeriod, phase, from || undefined, to || undefined),
    [funnelConfig, tablePeriod, phase, from, to]
  );

  const chartData = useMemo(
    () => generatePhaseTableData(funnelConfig, chartPeriod, phase, from || undefined, to || undefined),
    [funnelConfig, chartPeriod, phase, from, to]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          options={MARKET_OPTIONS}
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="w-48"
        />
        <Select
          options={CHANNEL_OPTIONS}
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-48"
        />
        <Select
          options={MOTION_TYPE_OPTIONS}
          value={motionType}
          onChange={(e) => setMotionType(e.target.value)}
          className="w-48"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Phase Tabs */}
      <Tabs tabs={PHASE_TABS} defaultValue="acquisition" onValueChange={setPhase}>
        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-3 h-8 w-32 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : phase === 'acquisition' && acqKpis ? (() => {
          const arrChange = formatChange(acqKpis.newArrChange);
          const arpuChange = formatChange(acqKpis.arpuChange);
          const cacChange = acqKpis.isPaid
            ? formatChangeInverted(acqKpis.cacOrConversionChange)
            : formatChange(acqKpis.cacOrConversionChange);
          const pbChange = formatChangeInverted(acqKpis.paybackChange);
          const scChange = formatChangeInverted(acqKpis.salesCycleChange);
          return (
            <div className="grid grid-cols-4 gap-4">
              <KpiCard
                title="New ARR"
                value={formatCurrency(acqKpis.newArr)}
                subtitle={!from && !to ? 'This month' : 'Filtered period'}
                trend={arrChange.trend}
                trendValue={arrChange.text + ' vs last month'}
              />
              <KpiCard
                title="ARPU"
                value={formatCurrency(acqKpis.arpu)}
                subtitle="Per customer"
                trend={arpuChange.trend}
                trendValue={arpuChange.text + ' vs last month'}
              />
              {acqKpis.isPaid ? (
                <KpiCard
                  title="CAC"
                  value={formatCurrency(acqKpis.cacOrConversion)}
                  subtitle="Cost per customer"
                  trend={cacChange.trend}
                  trendValue={cacChange.text + ' vs last month'}
                />
              ) : (
                <KpiCard
                  title="Conversion Rate"
                  value={formatPercent(acqKpis.cacOrConversion)}
                  subtitle="First stage → Win"
                  trend={cacChange.trend}
                  trendValue={cacChange.text + ' vs last month'}
                />
              )}
              {acqKpis.isPaid ? (
                <KpiCard
                  title="Payback"
                  value={formatMonths(acqKpis.paybackMonths)}
                  subtitle="CAC / ARPU"
                  trend={pbChange.trend}
                  trendValue={pbChange.text + ' vs last month'}
                />
              ) : (
                <KpiCard
                  title="Sales Cycle"
                  value={formatDays(acqKpis.salesCycleDays)}
                  subtitle="First stage → Win"
                  trend={scChange.trend}
                  trendValue={scChange.text + ' vs last month'}
                />
              )}
            </div>
          );
        })() : (
          <div className="grid grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={formatCurrency(kpis.totalRevenue)}
              subtitle="90-day total"
            />
            <KpiCard
              title="Total Pipeline"
              value={formatCurrency(kpis.totalPipeline)}
              subtitle="Active pipeline"
            />
            <KpiCard
              title="Blended CAC"
              value={formatCurrency(kpis.blendedCac)}
              subtitle="Per lead"
            />
            <KpiCard
              title="Total Leads"
              value={formatNumber(kpis.totalLeads)}
              subtitle="Across all stages"
            />
          </div>
        )}

        {/* Table / Graph sub-tabs */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <Tabs tabs={VIEW_TABS} defaultValue="table" onValueChange={setView}>
              {view === 'table' ? (
                <PhaseMetricsTable
                  config={funnelConfig}
                  data={tableData}
                  period={tablePeriod}
                  onPeriodChange={setTablePeriod}
                />
              ) : (
                <PhaseMetricsChart
                  config={funnelConfig}
                  data={chartData}
                  period={chartPeriod}
                  onPeriodChange={setChartPeriod}
                />
              )}
            </Tabs>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
