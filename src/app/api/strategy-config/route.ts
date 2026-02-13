import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import {
  getActiveStrategyConfig,
  updateStrategyConfig,
  StrategyConfigUpdate,
} from '@/lib/queries/strategy-config';

export async function GET() {
  try {
    await getAuthenticatedUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  try {
    const data = await getActiveStrategyConfig();
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
      { error: 'Only admins can update strategy configuration' },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as StrategyConfigUpdate & { id: string };

    if (!body.id) {
      return NextResponse.json(
        { error: 'Config id is required' },
        { status: 400 }
      );
    }

    const { id, ...updates } = body;
    const data = await updateStrategyConfig(id, updates, user.id);
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
