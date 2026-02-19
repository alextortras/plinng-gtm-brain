'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { FieldMappingTab } from '@/components/integrations/field-mapping-tab';
import { SyncHistoryTable } from '@/components/integrations/sync-history-table';
import { ConnectDialog } from '@/components/integrations/connect-dialog';
import { DisconnectDialog } from '@/components/integrations/disconnect-dialog';
import { SyncStatusIndicator } from '@/components/integrations/sync-status-indicator';
import { getCatalogEntry } from '@/lib/integrations/catalog';
import type { Integration, IntegrationFieldMapping, IntegrationSync } from '@/types/database';
import type { StageMappingRow, SourceFieldsByObject } from '@/types/integrations';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Unplug,
  Zap,
} from 'lucide-react';

const STATUS_CONFIG = {
  connected: { label: 'Connected', variant: 'low' as const, icon: CheckCircle2 },
  connecting: { label: 'Connecting...', variant: 'medium' as const, icon: Loader2 },
  error: { label: 'Error', variant: 'high' as const, icon: XCircle },
  disconnected: { label: 'Not Connected', variant: 'outline' as const, icon: Unplug },
};

const DETAIL_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'field-mapping', label: 'Field Mapping' },
  { value: 'sync-history', label: 'Sync History' },
];

export default function IntegrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const provider = params.provider as string;
  const catalog = getCatalogEntry(provider);

  const { data: integration, loading, refetch } = useApi<Omit<Integration, 'credentials_encrypted'>>(
    `/api/integrations/${provider}`
  );
  const { data: mappings, refetch: refetchMappings } = useApi<IntegrationFieldMapping[]>(
    `/api/integrations/${provider}/mappings`
  );
  const { data: syncs } = useApi<IntegrationSync[]>(
    `/api/integrations/${provider}/sync`
  );
  const { data: sourceFields } = useApi<SourceFieldsByObject>(
    `/api/integrations/${provider}/fields`
  );

  const [activeTab, setActiveTab] = useState('overview');
  const [showConnect, setShowConnect] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [savingMappings, setSavingMappings] = useState(false);

  // Mock lifecycle stage mappings for HubSpot
  const [stageMappings, setStageMappings] = useState<StageMappingRow[]>([]);

  useEffect(() => {
    if (provider === 'hubspot' && integration?.status === 'connected') {
      // Initialize lifecycle stage mappings with demo data
      setStageMappings([
        { source_stage_id: 'subscriber', source_stage_label: 'Subscriber', funnel_stage: 'lead' },
        { source_stage_id: 'lead', source_stage_label: 'Lead', funnel_stage: 'lead' },
        { source_stage_id: 'marketingqualifiedlead', source_stage_label: 'Marketing Qualified Lead', funnel_stage: 'sql' },
        { source_stage_id: 'salesqualifiedlead', source_stage_label: 'Sales Qualified Lead', funnel_stage: 'sql' },
        { source_stage_id: 'opportunity', source_stage_label: 'Opportunity', funnel_stage: 'sal' },
        { source_stage_id: 'customer', source_stage_label: 'Customer', funnel_stage: 'win' },
        { source_stage_id: 'evangelist', source_stage_label: 'Evangelist', funnel_stage: 'win' },
        { source_stage_id: 'other', source_stage_label: 'Other', funnel_stage: '' },
      ]);
    }
  }, [provider, integration?.status]);

  if (!catalog) {
    return (
      <div className="space-y-4">
        <Link href="/settings/integrations" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Integrations
        </Link>
        <p className="text-sm text-destructive">Unknown integration provider: {provider}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = integration?.status ?? 'disconnected';
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const isConnected = status === 'connected';

  const handleConnect = async (credentials?: { api_key: string; secret_key: string }) => {
    try {
      const res = await fetch(`/api/integrations/${provider}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials ?? {}),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to connect');
      }

      const data = await res.json();

      if (data.data?.redirect_url) {
        window.location.href = data.data.redirect_url;
      } else {
        // API key flow or demo mode — just refresh
        setShowConnect(false);
        refetch();
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch(`/api/integrations/${provider}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to disconnect');
      }

      setShowDisconnect(false);
      router.push('/settings/integrations');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to disconnect');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/integrations/${provider}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      setTestResult(data.data);
    } catch {
      setTestResult({ success: false, message: 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`/api/integrations/${provider}/sync`, {
        method: 'POST',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveMappings = async (updated: IntegrationFieldMapping[]) => {
    setSavingMappings(true);
    try {
      const res = await fetch(`/api/integrations/${provider}/mappings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings: updated }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save');
      }

      refetchMappings();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSavingMappings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/settings/integrations" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Integrations
      </Link>

      {/* Connection status card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{catalog.name}</CardTitle>
              <CardDescription>{catalog.description}</CardDescription>
            </div>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1.5">
              <StatusIcon className={`h-3 w-3 ${status === 'connecting' ? 'animate-spin' : ''}`} />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        {isConnected && integration && (
          <CardContent className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {integration.account_name && (
                  <p className="text-sm font-medium">{integration.account_name}</p>
                )}
                <SyncStatusIndicator
                  lastSyncAt={syncs?.[0]?.started_at ?? null}
                  errorCount={syncs?.filter((s) => s.status === 'error').length ?? 0}
                  status={status}
                />
              </div>
              {integration.connected_at && (
                <p className="text-xs text-muted-foreground">
                  Connected {new Date(integration.connected_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Not connected: show connect button */}
      {!isConnected && status !== 'connecting' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Zap className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Connect {catalog.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {status === 'error' && integration?.error_message
                  ? integration.error_message
                  : `Set up a read-only connection to start syncing data.`}
              </p>
            </div>
            <Button onClick={() => setShowConnect(true)}>
              {status === 'error' ? 'Reconnect' : 'Connect'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connected: tabs */}
      {isConnected && (
        <>
          <Tabs
            tabs={DETAIL_TABS}
            defaultValue="overview"
            onValueChange={setActiveTab}
            variant="underline"
          />

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
                  {testing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Testing...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" />Test Connection</>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                  {syncing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" />Sync Now</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/5"
                  onClick={() => setShowDisconnect(true)}
                >
                  <Unplug className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>

              {testResult && (
                <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  testResult.success
                    ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200'
                    : 'bg-destructive/5 text-destructive'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {testResult.message}
                </div>
              )}

              {/* Account info */}
              {integration && (
                <Card>
                  <CardContent className="p-4">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Provider</dt>
                        <dd className="font-medium">{catalog.name}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Auth Type</dt>
                        <dd className="font-medium capitalize">{integration.auth_type.replace('_', ' ')}</dd>
                      </div>
                      {integration.account_name && (
                        <div>
                          <dt className="text-muted-foreground">Account</dt>
                          <dd className="font-medium">{integration.account_name}</dd>
                        </div>
                      )}
                      {integration.scopes.length > 0 && (
                        <div className="col-span-2">
                          <dt className="text-muted-foreground">Scopes</dt>
                          <dd className="mt-1 flex flex-wrap gap-1">
                            {integration.scopes.map((s) => (
                              <span key={s} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs">
                                {s}
                              </span>
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Field Mapping tab */}
          {activeTab === 'field-mapping' && (
            <FieldMappingTab
              provider={provider}
              mappings={mappings ?? []}
              sourceFields={sourceFields ?? {}}
              stageMappings={stageMappings}
              onStageMappingsChange={setStageMappings}
              onSave={handleSaveMappings}
              saving={savingMappings}
            />
          )}

          {/* Sync History tab */}
          {activeTab === 'sync-history' && (
            <SyncHistoryTable syncs={syncs ?? []} />
          )}
        </>
      )}

      {/* Dialogs */}
      <ConnectDialog
        integration={catalog}
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onConnect={handleConnect}
      />
      <DisconnectDialog
        providerName={catalog.name}
        open={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
