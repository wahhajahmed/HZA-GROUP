import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, PaginatedResponse } from '@/types';

export class ProductRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as Product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as Product;
  }

  async findFeatured(limit = 8): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data as Product[];
  }

  async findByCategory(
    categoryId: string,
    page = 1,
    pageSize = 12
  ): Promise<PaginatedResponse<Product>> {
    return this.findByCategoryIds([categoryId], page, pageSize);
  }

  /** Filter products by multiple category IDs (used for hierarchical browsing) */
  async findByCategoryIds(
    categoryIds: string[],
    page = 1,
    pageSize = 12
  ): Promise<PaginatedResponse<Product>> {
    if (categoryIds.length === 0)
      return { data: [], count: 0, page, pageSize, totalPages: 0 };

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .in('category_id', categoryIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

    return {
      data: data as Product[],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findAll(
    page = 1,
    pageSize = 12,
    search?: string
  ): Promise<PaginatedResponse<Product>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

    return {
      data: data as Product[],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  // Admin — includes inactive products
  async adminFindAll(
    page = 1,
    pageSize = 20,
    search?: string,
    filter?: string
  ): Promise<PaginatedResponse<Product>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (filter && filter !== 'all') {
      if (filter === 'low_stock') {
        query = query.lt('stock', 5);
      } else if (filter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (filter === 'active') {
        query = query.eq('is_active', true);
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false);
      }
    }

    const { data, error, count } = await query.range(from, to);

    if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

    return {
      data: data as Product[],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async adminFindById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Product;
  }

  async create(input: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(input)
      .select('*, category:categories(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as Product;
  }

  async update(id: string, input: Partial<Product>): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as Product;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async findLowStock(threshold = 5): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .lte('stock', threshold)
      .eq('is_active', true)
      .order('stock', { ascending: true });

    if (error) return [];
    return data as Product[];
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const { error } = await this.supabase.rpc('decrement_product_stock', {
      p_product_id: productId,
      p_quantity: quantity,
    });

    if (error) throw new Error(error.message);
  }
}
