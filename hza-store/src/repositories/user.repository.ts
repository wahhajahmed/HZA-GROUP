import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, PaginatedResponse } from '@/types';

export class UserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async adminFindAll(
    page = 1,
    pageSize = 20,
    search?: string
  ): Promise<PaginatedResponse<Profile>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('is_admin', false)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query.range(from, to);

    if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

    return {
      data: data as Profile[],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async update(id: string, input: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Profile;
  }

  async toggleBlock(id: string, isBlocked: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ is_blocked: isBlocked })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
