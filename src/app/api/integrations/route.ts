import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getIntegrations } from '@/lib/queries/integrations';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';
import { INTEGRATION_CATALOG } from '@/lib/integrations/catalog';
import type { IntegrationWithStatus } from '@/types/integrations';

export async function GET(request: NextRequest) {
  // Demo mode: return mock data
  if (isDemoMode()) {
    const mockData = resolveMockData(request.url);
    return NextResponse.json({ data: mockData });
  }

  try {
    await getAuthenticatedUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  try {
    const integrations = await getIntegrations();

    // Merge catalog entries with DB status
    const result: IntegrationWithStatus[] = INTEGRATION_CATALOG.map((catalog) => {
      const dbRecord = integrations.find((i) => i.provider === catalog.provider);
      return {
        ...catalog,
        status: dbRecord?.status ?? 'disconnected',
        account_name: dbRecord?.account_name ?? null,
        connected_at: dbRecord?.connected_at ?? null,
        error_message: dbRecord?.error_message ?? null,
        last_sync_at: null,
        last_sync_errors: 0,
        integration_id: dbRecord?.id ?? null,
      };
    });

    return NextResponse.json({ data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
