import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getFunnelMetrics, FunnelMetricsFilters } from '@/lib/queries/funnel-metrics';
import { FunnelStage, Market, SalesMotion } from '@/types/database';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';

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

  const params = request.nextUrl.searchParams;

  const filters: FunnelMetricsFilters = {};
  if (params.has('market')) filters.market = params.get('market') as Market;
  if (params.has('motion')) filters.motion = params.get('motion') as SalesMotion;
  if (params.has('stage')) filters.stage = params.get('stage') as FunnelStage;
  if (params.has('from')) filters.from = params.get('from')!;
  if (params.has('to')) filters.to = params.get('to')!;
  if (params.has('limit')) filters.limit = parseInt(params.get('limit')!, 10);

  try {
    const data = await getFunnelMetrics(filters);
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
