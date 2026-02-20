// ============================================================
// HubSpot API Client — direct fetch, no SDK dependency
// All calls are read-only per PRD mandate
// ============================================================

const HUBSPOT_AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

const HUBSPOT_SCOPES = [
  'crm.objects.deals.read',
  'crm.objects.contacts.read',
  'crm.schemas.deals.read',
  'crm.schemas.contacts.read',
];

function getClientId(): string {
  const id = process.env.HUBSPOT_CLIENT_ID;
  if (!id) throw new Error('HUBSPOT_CLIENT_ID is not configured');
  return id;
}

function getClientSecret(): string {
  const secret = process.env.HUBSPOT_CLIENT_SECRET;
  if (!secret) throw new Error('HUBSPOT_CLIENT_SECRET is not configured');
  return secret;
}

function getRedirectUri(): string {
  return (
    process.env.HUBSPOT_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`
  );
}

// --- OAuth ---

export function getHubSpotAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    scope: HUBSPOT_SCOPES.join(' '),
    state,
  });

  return `${HUBSPOT_AUTH_URL}?${params.toString()}`;
}

export interface HubSpotTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeCodeForTokens(code: string): Promise<HubSpotTokens> {
  const res = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getRedirectUri(),
      code,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot token exchange failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<HubSpotTokens> {
  const res = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot token refresh failed: ${res.status} ${body}`);
  }

  return res.json();
}

// --- API Helpers ---

async function hubspotGet<T>(accessToken: string, path: string): Promise<T> {
  const res = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot API error: ${res.status} ${body}`);
  }

  return res.json();
}

// --- Deal Pipelines ---

interface HubSpotPipelineResponse {
  results: {
    id: string;
    label: string;
    stages: {
      id: string;
      label: string;
      displayOrder: number;
    }[];
  }[];
}

export async function fetchDealPipelines(accessToken: string) {
  const data = await hubspotGet<HubSpotPipelineResponse>(
    accessToken,
    '/crm/v3/pipelines/deals'
  );
  return data.results;
}

// --- Properties ---

interface HubSpotPropertiesResponse {
  results: {
    name: string;
    label: string;
    type: string;
    fieldType: string;
    groupName: string;
    options?: { label: string; value: string }[];
  }[];
}

export async function fetchDealProperties(accessToken: string) {
  const data = await hubspotGet<HubSpotPropertiesResponse>(
    accessToken,
    '/crm/v3/properties/deals'
  );
  return data.results;
}

export async function fetchContactProperties(accessToken: string) {
  const data = await hubspotGet<HubSpotPropertiesResponse>(
    accessToken,
    '/crm/v3/properties/contacts'
  );
  return data.results;
}

// --- Test Connection ---

export async function testConnection(
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  try {
    await hubspotGet(accessToken, '/crm/v3/objects/deals?limit=1');
    return { success: true, message: 'Connection successful. Fetched 1 deal.' };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Connection failed',
    };
  }
}
