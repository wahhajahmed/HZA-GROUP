import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '@/types';

export class CategoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return [];
    return data as Category[];
  }

  async adminFindAll(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return [];
    return data as Category[];
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as Category;
  }

  /** Count of active products for each category_id in the given list */
  async countProductsForCategories(
    categoryIds: string[]
  ): Promise<Record<string, number>> {
    if (categoryIds.length === 0) return {};
    const { data, error } = await this.supabase
      .from('products')
      .select('category_id')
      .in('category_id', categoryIds)
      .eq('is_active', true);

    if (error) return {};

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.category_id) {
        counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
      }
    }
    return counts;
  }

  async create(
    input: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  }

  async update(id: string, input: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
