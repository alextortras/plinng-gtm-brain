'use client';

import { useState, useMemo, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { KpiCard } from '@/components/kpi-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { RevenueForecast, ForecastScenario } from '@/types/database';
import { TrendingUp, Loader2 } from 'lucide-react';
import { isDemoMode } from '@/lib/mock-data';
import { useDimensionOptions } from '@/hooks/use-dimension-options';
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

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function formatStageLabel(stage: string): string {
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ForecastsPage() {
  const { motionOptions } = useDimensionOptions();
  const [motion, setMotion] = useState('');
  const [generating, setGenerating] = useState(false);

  const params = useMemo(() => {
    const p: Record<string, string> = { limit: '200' };
    if (motion) p.motion = motion;
    return p;
  }, [motion]);

  const { data: forecasts, loading, refetch } = useApi<RevenueForecast[]>(
    '/api/forecasts',
    params
  );

  const handleGenerate = useCallback(async () => {
    setGenerating(true);

    // Demo mode: just simulate a delay and refetch mock data
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 600));
      refetch();
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/forecasts/generate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to generate forecast');
    } finally {
      setGenerating(false);
    }
  }, [refetch]);

  // Aggregate totals per scenario
  const scenarioTotals = useMemo(() => {
    if (!forecasts) return {};
    const totals: Record<string, number> = {};
    for (const f of forecasts) {
      totals[f.scenario] = (totals[f.scenario] ?? 0) + Number(f.projected_revenue);
    }
    return totals;
  }, [forecasts]);

  // Chart data: funnel stage breakdown per scenario
  const chartData = useMemo(() => {
    if (!forecasts) return [];

    // Extract distinct funnel stages
    const stages = [...new Set(forecasts.map((f) => f.funnel_stage))].sort();

    return stages.map((stage) => {
      const row: Record<string, string | number> = {
        name: formatStageLabel(stage),
      };
      for (const scenario of ['best_case', 'commit', 'most_likely'] as ForecastScenario[]) {
        const total = forecasts
          .filter((f) => f.funnel_stage === stage && f.scenario === scenario)
          .reduce((s, f) => s + Number(f.projected_revenue), 0);
        row[scenario] = Math.round(total);
      }
      return row;
    });
  }, [forecasts]);

  // Extract deal explanations from forecasts
  const explanations = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return [];
    // Get explanations from the first forecast that has them
    for (const f of forecasts) {
      if (f.explanations && Array.isArray(f.explanations) && f.explanations.length > 0) {
        return f.explanations;
      }
    }
    return [];
  }, [forecasts]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {motionOptions.length > 1 && (
            <Select
              options={motionOptions}
              value={motion}
              onChange={(e) => setMotion(e.target.value)}
              className="w-48"
            />
          )}
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Forecast
            </>
          )}
        </Button>
      </div>

      {/* Scenario KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 h-8 w-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            title="Best Case"
            value={formatCurrency(scenarioTotals.best_case ?? 0)}
            subtitle="90-day projection"
            trend="up"
          />
          <KpiCard
            title="Commit"
            value={formatCurrency(scenarioTotals.commit ?? 0)}
            subtitle="90-day projection"
          />
          <KpiCard
            title="Most Likely"
            value={formatCurrency(scenarioTotals.most_likely ?? 0)}
            subtitle="90-day projection"
          />
        </div>
      )}

      {/* Scenario Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Forecast by Funnel Stage</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || chartData.length === 0 ? (
            <div className="flex h-[350px] items-center justify-center">
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : 'No forecast data. Click "Generate Forecast" to start.'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="best_case" name="Best Case" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commit" name="Commit" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="most_likely" name="Most Likely" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Funnel Stage Breakdown Table */}
      {forecasts && forecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Funnel Stage</th>
                  <th className="pb-3 font-medium">Motion</th>
                  <th className="pb-3 font-medium">Market</th>
                  <th className="pb-3 text-right font-medium">Best Case</th>
                  <th className="pb-3 text-right font-medium">Commit</th>
                  <th className="pb-3 text-right font-medium">Most Likely</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Group by funnel_stage + motion + market
                  const groups = new Map<string, Record<string, number>>();
                  for (const f of forecasts) {
                    const key = `${f.funnel_stage}|${f.motion}|${f.market}`;
                    const group = groups.get(key) ?? {};
                    group[f.scenario] = (group[f.scenario] ?? 0) + Number(f.projected_revenue);
                    groups.set(key, group);
                  }

                  return Array.from(groups.entries()).map(([key, scenarios]) => {
                    const [stage, mot, mkt] = key.split('|');
                    return (
                      <tr key={key} className="border-b border-border/50">
                        <td className="py-3">{formatStageLabel(stage)}</td>
                        <td className="py-3 capitalize">{mot.replace('_', ' ')}</td>
                        <td className="py-3 uppercase">{mkt}</td>
                        <td className="py-3 text-right">{formatCurrency(scenarios.best_case ?? 0)}</td>
                        <td className="py-3 text-right">{formatCurrency(scenarios.commit ?? 0)}</td>
                        <td className="py-3 text-right">{formatCurrency(scenarios.most_likely ?? 0)}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Deal Explanations */}
      {explanations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Deal Explanations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {explanations.map((exp, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                <Badge
                  variant={exp.likelihood > 70 ? 'low' : exp.likelihood > 40 ? 'medium' : 'high'}
                >
                  {exp.likelihood}%
                </Badge>
                <div>
                  <p className="text-sm font-medium">{exp.account_id}</p>
                  <p className="text-sm text-muted-foreground">{exp.explanation}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
