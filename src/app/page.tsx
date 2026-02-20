'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { PhaseMetricsTable } from '@/components/phase-metrics-table';
import { PhaseMetricsChart } from '@/components/phase-metrics-chart';
import {
  isPaidMotion,
  getPhaseFunnel,
  type PeriodType,
} from '@/lib/funnel-config';
import { useDimensionOptions } from '@/hooks/use-dimension-options';
import {
  generatePhaseTableData,
  generateAcquisitionKpis,
  generateRetentionKpis,
  generateExpansionKpis,
} from '@/lib/mock-data';

const PHASE_TABS = [
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'retention', label: 'Retention' },
  { value: 'expansion', label: 'Expansion' },
];

const VIEW_TABS = [
  { value: 'table', label: 'Table' },
  { value: 'graph', label: 'Graph' },
];

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
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
  const { marketOptions, channelOptions, motionOptions } = useDimensionOptions();
  const [market, setMarket] = useState('');
  const [channel, setChannel] = useState('');
  const [motionType, setMotionType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [phase, setPhase] = useState('acquisition');
  const [view, setView] = useState('table');
  const [period, setPeriod] = useState<PeriodType>('weekly');

  const paid = isPaidMotion(motionType);
  const hasFilters = market || channel || motionType || from || to;

  const resetFilters = () => {
    setMarket('');
    setChannel('');
    setMotionType('');
    setFrom('');
    setTo('');
  };

  const funnelConfig = useMemo(
    () => getPhaseFunnel(phase, motionType),
    [phase, motionType]
  );

  const acqKpis = useMemo(
    () => phase === 'acquisition'
      ? generateAcquisitionKpis(funnelConfig, phase, paid, from || undefined, to || undefined, market || undefined, channel || undefined)
      : null,
    [funnelConfig, phase, paid, from, to, market, channel]
  );

  const retKpis = useMemo(
    () => phase === 'retention'
      ? generateRetentionKpis(funnelConfig, from || undefined, to || undefined, market || undefined, channel || undefined)
      : null,
    [funnelConfig, phase, from, to, market, channel]
  );

  const expKpis = useMemo(
    () => phase === 'expansion'
      ? generateExpansionKpis(funnelConfig, from || undefined, to || undefined, market || undefined, channel || undefined)
      : null,
    [funnelConfig, phase, from, to, market, channel]
  );

  const viewData = useMemo(
    () => generatePhaseTableData(funnelConfig, period, phase, from || undefined, to || undefined, 42, market || undefined, channel || undefined),
    [funnelConfig, period, phase, from, to, market, channel]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Dimension filters */}
        <Select
          options={marketOptions}
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="w-40"
        />
        <Select
          options={channelOptions}
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-40"
        />
        {motionOptions.length > 1 && (
          <Select
            options={motionOptions}
            value={motionType}
            onChange={(e) => setMotionType(e.target.value)}
            className="w-36"
          />
        )}

        {/* Date range */}
        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex h-10 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Phase Tabs */}
      <Tabs tabs={PHASE_TABS} defaultValue="acquisition" onValueChange={setPhase}>
        {/* KPI Cards */}
        {phase === 'acquisition' && acqKpis ? (() => {
          const arrChange = formatChange(acqKpis.newArrChange);
          const arpuChange = formatChange(acqKpis.arpuChange);
          const cacChange = acqKpis.isPaid
            ? formatChangeInverted(acqKpis.cacOrConversionChange)
            : formatChange(acqKpis.cacOrConversionChange);
          const pbChange = formatChangeInverted(acqKpis.paybackChange);
          const scChange = formatChangeInverted(acqKpis.salesCycleChange);
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        })() : phase === 'retention' && retKpis ? (() => {
          const acChange = formatChange(retKpis.activeClientsChange);
          const churnChange = formatChangeInverted(retKpis.churnRateChange);
          const nrrChange = formatChange(retKpis.nrrChange);
          const grrChange = formatChange(retKpis.grrChange);
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                title="Active Clients"
                value={formatNumber(retKpis.activeClients)}
                subtitle={!from && !to ? 'This month' : 'Filtered period'}
                trend={acChange.trend}
                trendValue={acChange.text + ' vs last month'}
              />
              <KpiCard
                title="Churn Rate"
                value={formatPercent(retKpis.churnRate)}
                subtitle="Monthly"
                trend={churnChange.trend}
                trendValue={churnChange.text + ' vs last month'}
              />
              <KpiCard
                title="NRR"
                value={formatPercent(retKpis.nrr)}
                subtitle="Net Revenue Retention"
                trend={nrrChange.trend}
                trendValue={nrrChange.text + ' vs last month'}
              />
              <KpiCard
                title="GRR"
                value={formatPercent(retKpis.grr)}
                subtitle="Gross Revenue Retention"
                trend={grrChange.trend}
                trendValue={grrChange.text + ' vs last month'}
              />
            </div>
          );
        })() : phase === 'expansion' && expKpis ? (() => {
          const neChange = formatChange(expKpis.netExpansionMrrChange);
          const exChange = formatChange(expKpis.expansionMrrChange);
          const coChange = formatChangeInverted(expKpis.contractionMrrChange);
          const erChange = formatChange(expKpis.expansionRateChange);
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                title="Net Expansion MRR"
                value={formatCurrency(expKpis.netExpansionMrr)}
                subtitle={!from && !to ? 'This month' : 'Filtered period'}
                trend={neChange.trend}
                trendValue={neChange.text + ' vs last month'}
              />
              <KpiCard
                title="Expansion MRR"
                value={formatCurrency(expKpis.expansionMrr)}
                subtitle="Upsell + CrossSell"
                trend={exChange.trend}
                trendValue={exChange.text + ' vs last month'}
              />
              <KpiCard
                title="Contraction MRR"
                value={formatCurrency(expKpis.contractionMrr)}
                subtitle="Downsell + CrossSell Churn"
                trend={coChange.trend}
                trendValue={coChange.text + ' vs last month'}
              />
              <KpiCard
                title="Expansion Rate"
                value={formatPercent(expKpis.expansionRate)}
                subtitle="Net Expansion / Base MRR"
                trend={erChange.trend}
                trendValue={erChange.text + ' vs last month'}
              />
            </div>
          );
        })() : null}

        {/* Table / Graph section */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            {/* Controls bar: view toggle left, period selector right */}
            <div className="mb-4 flex items-center justify-between">
              <Tabs tabs={VIEW_TABS} defaultValue="table" variant="segmented" onValueChange={setView} />
              <div className="inline-flex rounded-md border border-border overflow-hidden">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
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

            {view === 'table' ? (
              <PhaseMetricsTable
                config={funnelConfig}
                data={viewData}
              />
            ) : (
              <PhaseMetricsChart
                config={funnelConfig}
                data={viewData}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
