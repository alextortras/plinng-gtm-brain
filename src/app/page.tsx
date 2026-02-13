'use client';

import { useState, useMemo } from 'react';
import { useApi } from '@/hooks/use-api';
import { KpiCard } from '@/components/kpi-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { FunnelChart } from '@/components/charts/funnel-chart';
import { DailyFunnelMetric } from '@/types/database';

const MARKET_OPTIONS = [
  { value: '', label: 'All Markets' },
  { value: 'us', label: 'United States' },
  { value: 'spain', label: 'Spain' },
];

const MOTION_OPTIONS = [
  { value: '', label: 'All Motions' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'partners', label: 'Partners' },
  { value: 'paid_ads', label: 'Paid Ads' },
  { value: 'organic', label: 'Organic' },
  { value: 'plg', label: 'PLG' },
];

const STAGES = [
  'awareness', 'education', 'selection', 'commit',
  'onboarding', 'impact', 'growth', 'advocacy',
] as const;

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

export default function DashboardPage() {
  const [market, setMarket] = useState('');
  const [motion, setMotion] = useState('');

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (market) p.market = market;
    if (motion) p.motion = motion;
    return p;
  }, [market, motion]);

  const { data: metrics, loading } = useApi<DailyFunnelMetric[]>(
    '/api/funnel-metrics',
    params
  );

  const kpis = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return { totalRevenue: 0, totalPipeline: 0, blendedCac: 0, totalLeads: 0 };
    }

    const totalRevenue = metrics.reduce((s, m) => s + Number(m.revenue), 0);
    const totalPipeline = metrics.reduce((s, m) => s + Number(m.pipeline_value), 0);
    const totalSpend = metrics.reduce((s, m) => s + Number(m.spend), 0);
    const totalLeads = metrics.reduce((s, m) => s + m.leads_count, 0);
    const blendedCac = totalLeads > 0 ? totalSpend / totalLeads : 0;

    return { totalRevenue, totalPipeline, blendedCac, totalLeads };
  }, [metrics]);

  const funnelData = useMemo(() => {
    if (!metrics) return [];

    return STAGES.map((stage) => {
      const stageMetrics = metrics.filter((m) => m.funnel_stage === stage);
      const us = stageMetrics
        .filter((m) => m.market === 'us')
        .reduce((s, m) => s + m.leads_count, 0);
      const spain = stageMetrics
        .filter((m) => m.market === 'spain')
        .reduce((s, m) => s + m.leads_count, 0);
      return { stage, us, spain };
    });
  }, [metrics]);

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
          options={MOTION_OPTIONS}
          value={motion}
          onChange={(e) => setMotion(e.target.value)}
          className="w-48"
        />
      </div>

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
      ) : (
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

      {/* Bowtie Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bowtie Funnel — Leads by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[350px] items-center justify-center">
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          ) : (
            <FunnelChart data={funnelData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
