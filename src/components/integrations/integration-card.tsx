'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SyncStatusIndicator } from './sync-status-indicator';
import type { IntegrationWithStatus } from '@/types/integrations';
import {
  Globe,
  BarChart3,
  Search,
  Share2,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  BarChart3,
  Search,
  Share2,
};

const CATEGORY_LABELS: Record<string, string> = {
  crm: 'CRM',
  product_analytics: 'Product Analytics',
  advertising: 'Advertising',
};

const STATUS_CONFIG = {
  connected: { label: 'Connected', variant: 'low' as const },
  connecting: { label: 'Connecting', variant: 'medium' as const },
  error: { label: 'Error', variant: 'high' as const },
  disconnected: { label: 'Not Connected', variant: 'outline' as const },
};

interface IntegrationCardProps {
  integration: IntegrationWithStatus;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const Icon = ICON_MAP[integration.icon] ?? Globe;
  const statusConfig = STATUS_CONFIG[integration.status];
  const isConnected = integration.status === 'connected';
  const isError = integration.status === 'error';

  return (
    <Card className={cn(
      'transition-shadow hover:shadow-md',
      isError && 'border-destructive/30',
    )}>
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isConnected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <span className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[integration.category]}
              </span>
            </div>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {integration.description}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-1.5">
          {integration.features.map((f) => (
            <span
              key={f.label}
              className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {f.label}
            </span>
          ))}
        </div>

        {/* Sync status (when connected) */}
        {(isConnected || isError) && (
          <SyncStatusIndicator
            lastSyncAt={integration.last_sync_at}
            errorCount={integration.last_sync_errors}
            status={integration.status}
          />
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          {integration.status === 'disconnected' ? (
            <Link href={`/settings/integrations/${integration.provider}`}>
              <Button className="w-full" size="sm">
                Connect
              </Button>
            </Link>
          ) : integration.status === 'error' ? (
            <Link href={`/settings/integrations/${integration.provider}`}>
              <Button className="w-full" variant="destructive" size="sm">
                Reconnect
              </Button>
            </Link>
          ) : (
            <Link href={`/settings/integrations/${integration.provider}`}>
              <Button className="w-full" variant="outline" size="sm">
                Configure
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
