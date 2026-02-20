import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getIntegrationByProvider } from '@/lib/queries/integrations';
import {
  fetchDealProperties,
  fetchContactProperties,
} from '@/lib/integrations/hubspot';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';
import type { IntegrationProvider } from '@/types/database';

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (isDemoMode()) {
    const mockData = resolveMockData(`${request.nextUrl.origin}/api/integrations/${provider}/fields`);
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
    if (!integration || integration.status !== 'connected') {
      return NextResponse.json(
        { error: 'Integration not connected' },
        { status: 400 }
      );
    }

    if (provider === 'hubspot') {
      const credentials = JSON.parse(integration.credentials_encrypted ?? '{}');
      const accessToken = credentials.access_token;

      if (!accessToken) {
        return NextResponse.json(
          { error: 'Missing access token' },
          { status: 400 }
        );
      }

      const [dealProps, contactProps] = await Promise.all([
        fetchDealProperties(accessToken),
        fetchContactProperties(accessToken),
      ]);

      return NextResponse.json({
        data: {
          deals: dealProps.map((p) => ({
            name: p.name,
            label: p.label,
            type: p.type,
            ...(p.type === 'enumeration' && p.options ? { options: p.options } : {}),
          })),
          contacts: contactProps.map((p) => ({
            name: p.name,
            label: p.label,
            type: p.type,
            ...(p.type === 'enumeration' && p.options ? { options: p.options } : {}),
          })),
        },
      });
    }

    // Stub for other providers
    return NextResponse.json({ data: {} });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
