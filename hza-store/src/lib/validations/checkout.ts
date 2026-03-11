import { z } from 'zod';
import { PK_PHONE_REGEX } from '@/lib/utils';

export const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      PK_PHONE_REGEX,
      'Please enter a valid Pakistani mobile number (e.g. 03001234567)',
    ),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address is too long'),
  city: z.string().min(1, 'Please select a city'),
  area: z.string().min(1, 'Please select an area'),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;

