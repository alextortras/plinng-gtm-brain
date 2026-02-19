'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Loader2, ExternalLink, Key } from 'lucide-react';
import type { IntegrationCatalogEntry } from '@/types/integrations';

interface ConnectDialogProps {
  integration: IntegrationCatalogEntry;
  open: boolean;
  onClose: () => void;
  onConnect: (credentials?: { api_key: string; secret_key: string }) => Promise<void>;
}

export function ConnectDialog({ integration, open, onClose, onConnect }: ConnectDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [connecting, setConnecting] = useState(false);

  if (!open) return null;

  const isOAuth = integration.auth_type === 'oauth2';

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (isOAuth) {
        await onConnect();
      } else {
        await onConnect({ api_key: apiKey, secret_key: secretKey });
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-lg">Connect {integration.name}</CardTitle>
          <CardDescription>
            {isOAuth
              ? `You'll be redirected to ${integration.name} to authorize read-only access.`
              : `Enter your ${integration.name} API credentials to connect.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Read-only disclaimer */}
          <div className="flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
            <Shield className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              GTM Brain only requests <strong>read-only</strong> access. We will never modify your {integration.name} data.
            </span>
          </div>

          {/* API key inputs (for non-OAuth providers) */}
          {!isOAuth && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter secret key"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={connecting || (!isOAuth && !apiKey)}
              className="flex-1"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : isOAuth ? (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Test & Connect
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
