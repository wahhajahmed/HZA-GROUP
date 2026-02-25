import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name is too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0, 'Price must be a positive number'),
  discount_price: z.coerce
    .number()
    .min(0, 'Discount price must be positive')
    .optional()
    .nullable(),
  stock: z.coerce
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  sku: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  category_id: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  meta_title: z.string().max(60).optional().nullable(),
  meta_description: z.string().max(160).optional().nullable(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name is too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const deliveryChargeSchema = z.object({
  city: z.string().min(2, 'City name is required'),
  charge: z.coerce.number().min(0, 'Charge must be positive'),
  free_delivery_above: z.coerce.number().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type DeliveryChargeSchema = z.infer<typeof deliveryChargeSchema>;
