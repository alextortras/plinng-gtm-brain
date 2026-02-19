import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { upsertIntegration } from '@/lib/queries/integrations';
import { getHubSpotAuthUrl } from '@/lib/integrations/hubspot';
import { isDemoMode } from '@/lib/mock-data';
import { cookies } from 'next/headers';

type RouteContext = { params: Promise<{ provider: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  // Demo mode: return mock redirect URL
  if (isDemoMode()) {
    return NextResponse.json({
      data: {
        redirect_url: null,
        demo: true,
        message: 'Demo mode: OAuth redirect is simulated. Integration marked as connected.',
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
      { error: 'Only admins can connect integrations' },
      { status: 403 }
    );
  }

  try {
    if (provider === 'hubspot') {
      // Generate random state for CSRF protection
      const state = crypto.randomUUID();

      // Store state in HTTP-only cookie (expires in 10 minutes)
      const cookieStore = await cookies();
      cookieStore.set('hubspot_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      });

      // Mark integration as "connecting"
      await upsertIntegration({
        provider: 'hubspot',
        status: 'connecting',
        auth_type: 'oauth2',
        credentials_encrypted: null,
        account_name: null,
        account_id: null,
        scopes: [],
        config: {},
        error_message: null,
        connected_at: null,
        connected_by: user.id,
      });

      const redirectUrl = getHubSpotAuthUrl(state);
      return NextResponse.json({ data: { redirect_url: redirectUrl } });
    }

    if (provider === 'amplitude') {
      // API key flow: validate the provided key
      const body = await request.json();
      const { api_key, secret_key } = body;

      if (!api_key) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        );
      }

      await upsertIntegration({
        provider: 'amplitude',
        status: 'connected',
        auth_type: 'api_key',
        credentials_encrypted: JSON.stringify({ api_key, secret_key }),
        account_name: 'Amplitude Project',
        account_id: null,
        scopes: [],
        config: {},
        error_message: null,
        connected_at: new Date().toISOString(),
        connected_by: user.id,
      });

      return NextResponse.json({
        data: { redirect_url: null, message: 'Connected successfully' },
      });
    }

    // Stub for other providers
    return NextResponse.json(
      { error: `${provider} integration is not yet available` },
      { status: 501 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
