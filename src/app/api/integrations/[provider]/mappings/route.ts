import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import {
  getIntegrationByProvider,
  getFieldMappings,
  upsertFieldMappings,
} from '@/lib/queries/integrations';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';
import type { IntegrationProvider } from '@/types/database';

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    const mockData = resolveMockData(`${request.nextUrl.origin}/api/integrations/${provider}/mappings`);
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

    const mappings = await getFieldMappings(integration.id);
    return NextResponse.json({ data: mappings });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    const body = await request.json();
    return NextResponse.json({ data: body.mappings ?? [] });
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
      { error: 'Only admins can update field mappings' },
      { status: 403 }
    );
  }

  try {
    const integration = await getIntegrationByProvider(provider as IntegrationProvider);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const body = await request.json();
    const mappings = body.mappings;

    if (!Array.isArray(mappings)) {
      return NextResponse.json(
        { error: 'mappings must be an array' },
        { status: 400 }
      );
    }

    // Ensure all mappings reference the correct integration
    const normalized = mappings.map((m: Record<string, unknown>) => ({
      ...m,
      integration_id: integration.id,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await upsertFieldMappings(normalized as any);
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
