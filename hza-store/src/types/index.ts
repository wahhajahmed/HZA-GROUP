// =============================================
// DATABASE TYPES — Generated from Supabase schema
// =============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type ShippingCategory = 'small_parcel' | 'medium_parcel' | 'bulky_cargo';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id: string | null;
  default_shipping_category: ShippingCategory;
  created_at: string;
  updated_at: string;
  // Joined
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  sku: string | null;
  is_featured: boolean;
  is_active: boolean;
  category_id: string | null;
  shipping_category: ShippingCategory;
  images: string[];
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined
  product?: Product;
}

export interface DeliveryCharge {
  id: string;
  city: string;
  charge: number;
  free_delivery_above: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AreaDeliveryCharge {
  id: string;
  city: string;
  area: string;
  small_parcel_charge: number;
  medium_parcel_charge: number;
  bulky_cargo_charge: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  area: string | null;
  notes: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  tracking_number: string | null;
  payment_method: string;
  reviewed: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  order_items?: OrderItem[];
  user?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
  // Joined
  product?: Product | null;
}

export interface Review {
  id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  is_visible: boolean;
  is_seeded: boolean;
  created_at: string;
}

// =============================================
// FORM / INPUT TYPES
// =============================================

export interface SignupInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
  confirm_password: string;
}

export interface CheckoutInput {
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  notes?: string;
}

export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock: number;
  sku?: string;
  is_featured: boolean;
  is_active: boolean;
  category_id?: string;
  images: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order?: number;
}

// =============================================
// UI TYPES
// =============================================

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  customersCount: number;
  lowStockProducts: Product[];
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// =============================================
// PROMOTIONS
// =============================================

export type DisplayMode    = 'popup' | 'slide';
export type AudienceType   = 'all' | 'logged_in' | 'guest';
export type ShowFrequency  = 'session' | 'daily' | 'always';

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  redirect_url: string | null;
  bg_color: string;
  start_datetime: string;
  end_datetime: string | null;
  is_active: boolean;
  display_mode: DisplayMode;
  audience_type: AudienceType;
  celebration_mode: boolean;
  show_frequency: ShowFrequency;
  created_at: string;
}
