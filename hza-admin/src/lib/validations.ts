import { z } from 'zod';
import { PK_PHONE_REGEX } from '@/lib/utils';

export const pkPhoneField = z
  .string()
  .regex(
    PK_PHONE_REGEX,
    'Please enter a valid Pakistani mobile number (e.g. 03001234567)',
  )
  .or(z.literal('').transform(() => null))
  .nullable()
  .optional();

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers and hyphens only'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  discount_price: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  category_id: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  meta_title: z.string().max(60).optional().nullable(),
  meta_description: z.string().max(160).optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers and hyphens only'),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const deliveryChargeSchema = z.object({
  city: z.string().min(2, 'City is required'),
  charge: z.coerce.number().min(0),
  free_delivery_above: z.coerce.number().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type DeliveryChargeSchema = z.infer<typeof deliveryChargeSchema>;
