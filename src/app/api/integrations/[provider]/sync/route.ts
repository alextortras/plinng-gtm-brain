import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import {
  getIntegrationByProvider,
  getSyncHistory,
  createSyncRecord,
} from '@/lib/queries/integrations';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';
import type { IntegrationProvider } from '@/types/database';

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    const mockData = resolveMockData(`${request.nextUrl.origin}/api/integrations/${provider}/sync`);
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
    const integration = await getIntegrationByProvider(provider as IntegrationProvider);
    if (!integration) {
      return NextResponse.json({ data: [] });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10);
    const history = await getSyncHistory(integration.id, limit);
    return NextResponse.json({ data: history });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    return NextResponse.json({
      data: {
        id: 'mock-sync-manual',
        status: 'success',
        records_synced: 42,
        records_failed: 0,
        message: 'Demo mode: sync simulated successfully.',
      },
    });
  }

  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can trigger syncs' },
      { status: 403 }
    );
  }

  try {
    const integration = await getIntegrationByProvider(provider as IntegrationProvider);
    if (!integration || integration.status !== 'connected') {
      return NextResponse.json(
        { error: 'Integration not connected' },
        { status: 400 }
      );
    }

    // Create a sync record (actual sync would be performed by a background job)
    const sync = await createSyncRecord({
      integration_id: integration.id,
      status: 'running',
      started_at: new Date().toISOString(),
      completed_at: null,
      records_synced: 0,
      records_failed: 0,
      error_details: null,
    });

    return NextResponse.json({ data: sync });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
