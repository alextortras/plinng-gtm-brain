import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getRepKpis, RepKpisFilters } from '@/lib/queries/rep-kpis';
import { RepRole } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const params = request.nextUrl.searchParams;

  const filters: RepKpisFilters = {};
  if (params.has('role')) filters.role = params.get('role') as RepRole;
  if (params.has('from')) filters.from = params.get('from')!;
  if (params.has('to')) filters.to = params.get('to')!;
  if (params.has('sort')) filters.sort = params.get('sort')!;
  if (params.has('order')) filters.order = params.get('order') as 'asc' | 'desc';
  if (params.has('limit')) filters.limit = parseInt(params.get('limit')!, 10);

  try {
    const data = await getRepKpis(filters);
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
