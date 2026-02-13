'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RepKpi } from '@/types/database';

type RoleTab = 'sdr' | 'ae' | 'csm';

const TABS: { value: RoleTab; label: string }[] = [
  { value: 'sdr', label: 'SDRs' },
  { value: 'ae', label: 'AEs' },
  { value: 'csm', label: 'CSMs' },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function formatPercent(val: number): string {
  return (val * 100).toFixed(1) + '%';
}

// Aggregate KPIs by user
function aggregateByUser(kpis: RepKpi[]) {
  const map = new Map<string, RepKpi[]>();
  for (const kpi of kpis) {
    const rows = map.get(kpi.user_id) ?? [];
    rows.push(kpi);
    map.set(kpi.user_id, rows);
  }
  return map;
}

function avg(values: (number | null)[]): number {
  const valid = values.filter((v): v is number => v !== null);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function sum(values: (number | null)[]): number {
  return values.reduce((a: number, b) => a + (Number(b) || 0), 0);
}

function SdrTable({ kpis }: { kpis: RepKpi[] }) {
  const byUser = aggregateByUser(kpis);
  const rows = Array.from(byUser.entries())
    .map(([userId, data]) => ({
      userId,
      totalSals: sum(data.map((d) => d.sals_generated)),
      avgConversion: avg(data.map((d) => d.lead_to_sal_conversion_rate)),
      totalArr: sum(data.map((d) => d.arr_from_sals)),
    }))
    .sort((a, b) => b.totalSals - a.totalSals);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="pb-3 font-medium">#</th>
          <th className="pb-3 font-medium">Rep</th>
          <th className="pb-3 text-right font-medium">SALs Generated</th>
          <th className="pb-3 text-right font-medium">Lead → SAL %</th>
          <th className="pb-3 text-right font-medium">ARR from SALs</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.userId} className="border-b border-border/50">
            <td className="py-3 font-medium">{i + 1}</td>
            <td className="py-3">
              <span className="font-medium">{row.userId.slice(0, 8)}...</span>
            </td>
            <td className="py-3 text-right font-semibold">{row.totalSals}</td>
            <td className="py-3 text-right">{formatPercent(row.avgConversion)}</td>
            <td className="py-3 text-right">{formatCurrency(row.totalArr)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AeTable({ kpis }: { kpis: RepKpi[] }) {
  const byUser = aggregateByUser(kpis);
  const rows = Array.from(byUser.entries())
    .map(([userId, data]) => ({
      userId,
      totalClosedWon: sum(data.map((d) => d.arr_closed_won)),
      totalExpansion: sum(data.map((d) => d.arr_expansion)),
      avgConversion: avg(data.map((d) => d.sal_to_closed_won_rate)),
      avgChurn: avg(data.map((d) => d.trailing_churn_rate)),
    }))
    .sort((a, b) => b.totalClosedWon - a.totalClosedWon);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="pb-3 font-medium">#</th>
          <th className="pb-3 font-medium">Rep</th>
          <th className="pb-3 text-right font-medium">ARR Closed Won</th>
          <th className="pb-3 text-right font-medium">ARR Expansion</th>
          <th className="pb-3 text-right font-medium">SAL → CW %</th>
          <th className="pb-3 text-right font-medium">Trailing Churn</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.userId} className="border-b border-border/50">
            <td className="py-3 font-medium">{i + 1}</td>
            <td className="py-3">
              <span className="font-medium">{row.userId.slice(0, 8)}...</span>
            </td>
            <td className="py-3 text-right font-semibold">{formatCurrency(row.totalClosedWon)}</td>
            <td className="py-3 text-right">{formatCurrency(row.totalExpansion)}</td>
            <td className="py-3 text-right">{formatPercent(row.avgConversion)}</td>
            <td className="py-3 text-right">
              <Badge variant={row.avgChurn > 0.04 ? 'high' : row.avgChurn > 0.02 ? 'medium' : 'low'}>
                {formatPercent(row.avgChurn)}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CsmTable({ kpis }: { kpis: RepKpi[] }) {
  const byUser = aggregateByUser(kpis);
  const rows = Array.from(byUser.entries())
    .map(([userId, data]) => ({
      userId,
      avgGrr: avg(data.map((d) => d.grr)),
      avgChurn: avg(data.map((d) => d.churn_rate)),
      avgResolution: avg(data.map((d) => d.retention_deal_resolution_rate)),
      avgHealth: avg(data.map((d) => d.account_health_score)),
    }))
    .sort((a, b) => b.avgGrr - a.avgGrr);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="pb-3 font-medium">#</th>
          <th className="pb-3 font-medium">Rep</th>
          <th className="pb-3 text-right font-medium">GRR</th>
          <th className="pb-3 text-right font-medium">Churn Rate</th>
          <th className="pb-3 text-right font-medium">Resolution Rate</th>
          <th className="pb-3 text-right font-medium">Health Score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.userId} className="border-b border-border/50">
            <td className="py-3 font-medium">{i + 1}</td>
            <td className="py-3">
              <span className="font-medium">{row.userId.slice(0, 8)}...</span>
            </td>
            <td className="py-3 text-right font-semibold">{formatPercent(row.avgGrr)}</td>
            <td className="py-3 text-right">
              <Badge variant={row.avgChurn > 0.04 ? 'high' : row.avgChurn > 0.02 ? 'medium' : 'low'}>
                {formatPercent(row.avgChurn)}
              </Badge>
            </td>
            <td className="py-3 text-right">{formatPercent(row.avgResolution)}</td>
            <td className="py-3 text-right">{row.avgHealth.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>('sdr');

  const { data: kpis, loading } = useApi<RepKpi[]>('/api/rep-kpis', {
    role: activeTab,
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
              activeTab === tab.value
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeTab === 'sdr' && 'SDR Leaderboard'}
            {activeTab === 'ae' && 'AE Leaderboard'}
            {activeTab === 'csm' && 'CSM Leaderboard'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : !kpis || kpis.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No data available</p>
          ) : (
            <>
              {activeTab === 'sdr' && <SdrTable kpis={kpis} />}
              {activeTab === 'ae' && <AeTable kpis={kpis} />}
              {activeTab === 'csm' && <CsmTable kpis={kpis} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
