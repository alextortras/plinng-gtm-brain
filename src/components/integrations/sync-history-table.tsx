'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { IntegrationSync } from '@/types/database';

interface SyncHistoryTableProps {
  syncs: IntegrationSync[];
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'Running...';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_BADGE = {
  running: { label: 'Running', variant: 'medium' as const },
  success: { label: 'Success', variant: 'low' as const },
  error: { label: 'Error', variant: 'high' as const },
};

export function SyncHistoryTable({ syncs }: SyncHistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (syncs.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No sync history yet. Syncs will appear here after the first data sync.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="w-8 px-2 py-2" />
            <th className="px-4 py-2 font-medium">Started At</th>
            <th className="px-4 py-2 font-medium">Duration</th>
            <th className="px-4 py-2 font-medium text-right">Records</th>
            <th className="px-4 py-2 font-medium text-right">Errors</th>
            <th className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {syncs.map((sync) => {
            const badge = STATUS_BADGE[sync.status];
            const hasErrors = sync.error_details !== null;
            const isExpanded = expandedRows.has(sync.id);

            return (
              <>
                <tr
                  key={sync.id}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50"
                  onClick={() => hasErrors && toggleRow(sync.id)}
                >
                  <td className="px-2 py-2.5">
                    {hasErrors ? (
                      isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-sm">{formatTime(sync.started_at)}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">
                    {formatDuration(sync.started_at, sync.completed_at)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm">
                    {sync.records_synced.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm">
                    {sync.records_failed > 0 ? (
                      <span className="text-destructive">{sync.records_failed}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </td>
                </tr>
                {isExpanded && hasErrors && (
                  <tr key={`${sync.id}-details`} className="border-b border-border last:border-0">
                    <td />
                    <td colSpan={5} className="px-4 py-3">
                      <div className="rounded-md bg-destructive/5 p-3 text-xs text-destructive">
                        {sync.error_details}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
