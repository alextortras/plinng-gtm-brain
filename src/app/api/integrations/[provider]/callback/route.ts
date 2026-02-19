import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/integrations/hubspot';
import { upsertIntegration } from '@/lib/queries/integrations';
import { cookies } from 'next/headers';

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (provider !== 'hubspot') {
    return NextResponse.json(
      { error: `OAuth callback not implemented for ${provider}` },
      { status: 501 }
    );
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings/integrations/hubspot?error=missing_params', request.url)
    );
  }

  // Validate state against cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get('hubspot_oauth_state')?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/settings/integrations/hubspot?error=invalid_state', request.url)
    );
  }

  // Clear the state cookie
  cookieStore.delete('hubspot_oauth_state');

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Store integration with encrypted credentials
    await upsertIntegration({
      provider: 'hubspot',
      status: 'connected',
      auth_type: 'oauth2',
      credentials_encrypted: JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
      }),
      account_name: null,
      account_id: null,
      scopes: ['crm.objects.deals.read', 'crm.objects.contacts.read', 'crm.schemas.deals.read', 'crm.schemas.contacts.read'],
      config: {},
      error_message: null,
      connected_at: new Date().toISOString(),
      connected_by: null,
    });

    return NextResponse.redirect(
      new URL('/settings/integrations/hubspot?connected=true', request.url)
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    // Mark integration as error
    await upsertIntegration({
      provider: 'hubspot',
      status: 'error',
      auth_type: 'oauth2',
      credentials_encrypted: null,
      account_name: null,
      account_id: null,
      scopes: [],
      config: {},
      error_message: message,
      connected_at: null,
      connected_by: null,
    }).catch(() => {});

    return NextResponse.redirect(
      new URL(`/settings/integrations/hubspot?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
