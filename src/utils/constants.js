export const APP_NAME = import.meta.env.VITE_APP_NAME || 'StoreFront Pro'
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
}

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIAL: 'partial',
  REFUNDED: 'refunded',
  FAILED: 'failed',
}

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
}

export const CURRENCIES = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', code: 'NGN' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
}

export const DEFAULT_CURRENCY = 'NGN'

export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'Sale', href: '/products?tag=sale' },
]

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'ShoppingBag' },
  { label: 'Products', href: '/admin/products', icon: 'Package' },
  { label: 'Categories', href: '/admin/categories', icon: 'Tag' },
  { label: 'Brands', href: '/admin/brands', icon: 'Award' },
  { label: 'Customers', href: '/admin/customers', icon: 'Users' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'BarChart2' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'Ticket' },
  { label: 'Reviews', href: '/admin/reviews', icon: 'Star' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp' },
]
