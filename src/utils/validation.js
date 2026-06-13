import { z } from 'zod'

export const emailSchema = z.string().email('Enter a valid email address').min(1, 'Email is required')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const addressSchema = z.object({
  label: z.string().optional(),
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('NG'),
  postal_code: z.string().optional(),
  is_default: z.boolean().default(false),
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  brand_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  compare_price: z.number().min(0).optional().nullable(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
})

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000),
})

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').max(50).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  min_order_amount: z.number().min(0).default(0),
  max_uses: z.number().int().min(1).optional().nullable(),
  is_active: z.boolean().default(true),
  starts_at: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
})
