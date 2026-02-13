'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Brain, Loader2 } from 'lucide-react';
import { BrainInsight } from '@/lib/brain/insights';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'tactical', label: 'Tactical' },
];

const URGENCY_OPTIONS = [
  { value: '', label: 'All Urgency' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function urgencyVariant(urgency: string): 'high' | 'medium' | 'low' {
  if (urgency === 'high') return 'high';
  if (urgency === 'medium') return 'medium';
  return 'low';
}

export default function BrainPage() {
  const [insights, setInsights] = useState<BrainInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawStream, setRawStream] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const generateInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRawStream('');
    setInsights([]);

    try {
      const res = await fetch('/api/brain/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setRawStream(accumulated);
      }

      // Try to parse the accumulated JSON
      try {
        const parsed = JSON.parse(accumulated);
        if (Array.isArray(parsed)) {
          setInsights(parsed);
        }
      } catch {
        // If JSON parse fails, try to extract array from the stream
        const match = accumulated.match(/\[[\s\S]*\]/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) {
              setInsights(parsed);
            }
          } catch {
            setError('Failed to parse AI response. Raw output is shown below.');
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredInsights = insights.filter((insight) => {
    if (categoryFilter && insight.category !== categoryFilter) return false;
    if (urgencyFilter && insight.urgency !== urgencyFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            options={CATEGORY_OPTIONS}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-44"
          />
          <Select
            options={URGENCY_OPTIONS}
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-44"
          />
        </div>
        <Button onClick={generateInsights} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Streaming preview */}
      {loading && rawStream && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              AI is analyzing your data...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {rawStream}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map((insight, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={urgencyVariant(insight.urgency)}>
                        {insight.urgency}
                      </Badge>
                      <Badge variant="outline">{insight.category}</Badge>
                      {insight.stage && (
                        <Badge variant="secondary">{insight.stage}</Badge>
                      )}
                      {insight.market && insight.market !== 'all' && (
                        <Badge variant="secondary">
                          {insight.market === 'us' ? 'US' : 'Spain'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{insight.headline}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !loading && insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">No insights yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &quot;Generate Insights&quot; to analyze your GTM data
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
