'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DisconnectDialogProps {
  providerName: string;
  open: boolean;
  onClose: () => void;
  onDisconnect: () => Promise<void>;
}

export function DisconnectDialog({ providerName, open, onClose, onDisconnect }: DisconnectDialogProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  if (!open) return null;

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Disconnect {providerName}
          </CardTitle>
          <CardDescription>
            This action cannot be undone. Are you sure you want to disconnect?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
            This will remove all field mappings and sync history for {providerName}.
            You will need to reconfigure everything if you reconnect later.
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex-1"
            >
              {disconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
