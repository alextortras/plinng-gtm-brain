import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getIntegrationByProvider } from '@/lib/queries/integrations';
import { testConnection } from '@/lib/integrations/hubspot';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';
import type { IntegrationProvider } from '@/types/database';

type RouteContext = { params: Promise<{ provider: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    const mockData = resolveMockData(`${request.nextUrl.origin}/api/integrations/${provider}/test`);
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
      return NextResponse.json(
        { data: { success: false, message: 'Integration not found' } }
      );
    }

    if (provider === 'hubspot' && integration.credentials_encrypted) {
      const credentials = JSON.parse(integration.credentials_encrypted);
      const result = await testConnection(credentials.access_token);
      return NextResponse.json({ data: result });
    }

    // Stub for other providers
    return NextResponse.json({
      data: {
        success: integration.status === 'connected',
        message: integration.status === 'connected'
          ? 'Connection is active'
          : 'Not connected',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({
      data: { success: false, message },
    });
  }
}
