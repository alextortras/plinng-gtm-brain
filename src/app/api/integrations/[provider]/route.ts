import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import {
  getIntegrationByProvider,
  updateIntegration,
  deleteIntegration,
} from '@/lib/queries/integrations';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';
import type { IntegrationProvider } from '@/types/database';

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    const mockData = resolveMockData(`${request.nextUrl.origin}/api/integrations/${provider}`);
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
      return NextResponse.json({ data: null });
    }
    // Never expose credentials to the client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credentials_encrypted: _cred, ...safe } = integration;
    return NextResponse.json({ data: safe });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    return NextResponse.json({ data: { provider, status: 'connected', message: 'Demo mode: update simulated' } });
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
      { error: 'Only admins can update integrations' },
      { status: 403 }
    );
  }

  try {
    const integration = await getIntegrationByProvider(provider as IntegrationProvider);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = await updateIntegration(integration.id, body);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credentials_encrypted: _cred, ...safe } = data;
    return NextResponse.json({ data: safe });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    return NextResponse.json({ data: { success: true, message: 'Demo mode: disconnect simulated' } });
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
      { error: 'Only admins can disconnect integrations' },
      { status: 403 }
    );
  }

  try {
    const integration = await getIntegrationByProvider(provider as IntegrationProvider);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await deleteIntegration(integration.id);
    return NextResponse.json({ data: { success: true } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
