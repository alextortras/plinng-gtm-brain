'use client';

import { cn } from '@/lib/utils';
import type { IntegrationStatus } from '@/types/database';

interface SyncStatusIndicatorProps {
  lastSyncAt: string | null;
  errorCount: number;
  status: IntegrationStatus;
  className?: string;
}

function relativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

export function SyncStatusIndicator({
  lastSyncAt,
  errorCount,
  status,
  className,
}: SyncStatusIndicatorProps) {
  const isError = status === 'error';
  const dotColor = isError ? 'bg-destructive' : 'bg-green-500';

  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <span className="relative flex h-2 w-2">
        <span className={cn(
          'absolute inline-flex h-full w-full rounded-full opacity-75',
          dotColor,
          !isError && 'animate-ping',
        )} />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', dotColor)} />
      </span>

      {lastSyncAt ? (
        <span>Last synced {relativeTime(lastSyncAt)}</span>
      ) : (
        <span>No sync yet</span>
      )}

      {errorCount > 0 && (
        <span className="ml-1 inline-flex items-center rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
          {errorCount} error{errorCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
