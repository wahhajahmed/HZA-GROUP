'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ApiResponse, Profile } from '@/types';
import type { SignupSchema, LoginSchema } from '@/lib/validations/auth';
import { SITE_URL } from '@/lib/constants';

export async function signUp(
  input: SignupSchema
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          phone: input.phone,
        },
        emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent('/login?verified=true')}`,
      },
    });

    if (error) return { data: null, error: error.message };

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function signIn(
  input: LoginSchema
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) return { data: null, error: error.message };

    // Check if user is blocked
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('email', input.email)
      .single();

    if (profile?.is_blocked) {
      await supabase.auth.signOut();
      return {
        data: null,
        error: 'Your account has been blocked. Please contact support.',
      };
    }

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Redirect through the server callback so the server can exchange the
      // code/token and set HTTP-only cookies before sending user to UI.
      redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
    });

    if (error) return { data: null, error: error.message };

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function resetPassword(password: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) return { data: null, error: error.message };

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminGetUsers(opts?: {
  query?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<Profile[]> & { total?: number }> {
  try {
    const supabase = await createClient()
    const page = opts?.page || 1
    const limit = opts?.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let queryBuilder = supabase.from('profiles').select('*', { count: 'exact' })

    if (opts?.query) {
      queryBuilder = queryBuilder.or(
        `full_name.ilike.%${opts.query}%,email.ilike.%${opts.query}%`
      )
    }

    const { data, error, count } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return { data: null, error: error.message }
    return { data: data as Profile[], error: null, total: count || 0 }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function adminToggleUserBlock(
  userId: string,
  isBlocked: boolean
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_blocked: isBlocked, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data: data as Profile, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function getCurrentUser(): Promise<ApiResponse<Profile | null>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: null };

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return { data: null, error: error.message };

    return { data: profile as Profile, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
