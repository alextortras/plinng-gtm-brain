import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types/database';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function getAuthenticatedUser(): Promise<UserProfile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError('Unauthorized');
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_uid', user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthError('User profile not found', 403);
  }

  return profile;
}
