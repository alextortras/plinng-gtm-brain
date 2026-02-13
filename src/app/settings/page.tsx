'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StrategyConfig, StrategyMode } from '@/types/database';
import { Settings, Save, Loader2 } from 'lucide-react';

const STRATEGY_MODES: { value: StrategyMode; label: string; description: string }[] = [
  {
    value: 'maximize_revenue',
    label: 'Maximize Revenue',
    description: 'Tolerate higher CAC to aggressively capture market share.',
  },
  {
    value: 'maximize_efficiency',
    label: 'Maximize Efficiency',
    description: 'Strict adherence to CAC payback period. Flag high-CAC campaigns immediately.',
  },
  {
    value: 'maximize_activation',
    label: 'Maximize Activation',
    description: 'Focus on product usage, onboarding velocity, and time-to-first-value.',
  },
];

export default function SettingsPage() {
  const { data: config, loading, refetch } = useApi<StrategyConfig>('/api/strategy-config');

  const [mode, setMode] = useState<StrategyMode>('maximize_efficiency');
  const [maxCacPayback, setMaxCacPayback] = useState(6);
  const [maxChurnRate, setMaxChurnRate] = useState(5);
  const [arpaMin, setArpaMin] = useState(80);
  const [arpaMax, setArpaMax] = useState(130);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setMode(config.mode);
      setMaxCacPayback(config.max_cac_payback_months);
      setMaxChurnRate(Number(config.max_churn_rate) * 100);
      setArpaMin(Number(config.arpa_min));
      setArpaMax(Number(config.arpa_max));
    }
  }, [config]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/strategy-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          mode,
          max_cac_payback_months: maxCacPayback,
          max_churn_rate: maxChurnRate / 100,
          arpa_min: arpaMin,
          arpa_max: arpaMax,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save');
      }

      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Strategy Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            AI Strategy Mode
          </CardTitle>
          <CardDescription>
            Controls how the Brain prioritizes its analysis and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STRATEGY_MODES.map((sm) => (
            <label
              key={sm.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                mode === sm.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <input
                type="radio"
                name="strategy"
                value={sm.value}
                checked={mode === sm.value}
                onChange={() => setMode(sm.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">{sm.label}</p>
                <p className="text-sm text-muted-foreground">{sm.description}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Guardrails */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Rule Guardrails</CardTitle>
          <CardDescription>
            These thresholds are injected into the AI system prompt and used to flag breaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Max CAC Payback (months)
              </label>
              <input
                type="number"
                value={maxCacPayback}
                onChange={(e) => setMaxCacPayback(Number(e.target.value))}
                min={1}
                max={24}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Max Churn Rate (%)
              </label>
              <input
                type="number"
                value={maxChurnRate}
                onChange={(e) => setMaxChurnRate(Number(e.target.value))}
                min={0}
                max={100}
                step={0.1}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                ARPA Min (EUR)
              </label>
              <input
                type="number"
                value={arpaMin}
                onChange={(e) => setArpaMin(Number(e.target.value))}
                min={0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                ARPA Max (EUR)
              </label>
              <input
                type="number"
                value={arpaMax}
                onChange={(e) => setArpaMax(Number(e.target.value))}
                min={0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
        {saved && (
          <Badge variant="low">Saved successfully</Badge>
        )}
      </div>
    </div>
  );
}
