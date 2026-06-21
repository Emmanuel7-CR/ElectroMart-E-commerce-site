import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AdminRoute } from '@/components/shared/AdminRoute'

// Layouts
import CustomerLayout from '@/components/layout/CustomerLayout'
import AuthLayout     from '@/components/layout/AuthLayout'
import AdminLayout    from '@/components/layout/AdminLayout'

// Eager (critical path)
import HomePage           from '@/features/home/pages/HomePage'
import LoginPage          from '@/features/auth/pages/LoginPage'
import RegisterPage       from '@/features/auth/pages/RegisterPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage  from '@/features/auth/pages/ResetPasswordPage'
import NotFoundPage       from '@/features/home/pages/NotFoundPage'

// Lazy — storefront
const ProductListPage   = lazy(() => import('@/features/products/pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'))
const CategoryPage      = lazy(() => import('@/features/products/pages/CategoryPage'))
const CategoriesPage    = lazy(() => import('@/features/categories/pages/CategoriesPage'))
const BrandsPage        = lazy(() => import('@/features/brands/pages/BrandsPage'))
const SearchResultsPage = lazy(() => import('@/features/search/pages/SearchResultsPage'))
const CartPage          = lazy(() => import('@/features/cart/pages/CartPage'))
const WishlistPage      = lazy(() => import('@/features/wishlist/pages/WishlistPage'))
const ProfilePage       = lazy(() => import('@/features/profile/pages/ProfilePage'))
const OrdersPage        = lazy(() => import('@/features/orders/pages/OrdersPage'))

// Lazy — Phase 3 checkout
const CheckoutPage          = lazy(() => import('@/features/checkout/pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('@/features/checkout/pages/OrderConfirmationPage'))
const OrderDetailPage       = lazy(() => import('@/features/orders/pages/OrderDetailPage'))

// Lazy — admin
const DashboardPage      = lazy(() => import('@/features/admin/pages/DashboardPage'))
const AdminOrdersPage    = lazy(() => import('@/features/admin/pages/AdminOrdersPage'))
const AdminProductsPage  = lazy(() => import('@/features/admin/pages/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('@/features/admin/pages/AdminCategoriesPage'))
const AdminBrandsPage    = lazy(() => import('@/features/admin/pages/AdminBrandsPage'))
const AdminCustomersPage = lazy(() => import('@/features/admin/pages/AdminCustomersPage'))
const AdminInventoryPage = lazy(() => import('@/features/admin/pages/AdminInventoryPage'))
const AdminCouponsPage   = lazy(() => import('@/features/admin/pages/AdminCouponsPage'))
const AdminReviewsPage   = lazy(() => import('@/features/admin/pages/AdminReviewsPage'))
const AdminAnalyticsPage = lazy(() => import('@/features/admin/pages/AdminAnalyticsPage'))
const AdminCustomerDetailPage = lazy(() => import('@/features/admin/pages/AdminCustomerDetailPage'))

const Wrap = ({ children }) => <Suspense fallback={<PageSpinner />}>{children}</Suspense>

const router = createBrowserRouter([
  // ── Customer / Storefront ────────────────────────────────────
  {
    element: <CustomerLayout />,
    errorElement: <ErrorBoundary><NotFoundPage /></ErrorBoundary>,
    children: [
      { index: true, element: <HomePage /> },

      // Products
      { path: 'products',              element: <Wrap><ProductListPage /></Wrap> },
      { path: 'products/:slug',        element: <Wrap><ProductDetailPage /></Wrap> },

      // Categories
      { path: 'categories',            element: <Wrap><CategoriesPage /></Wrap> },
      { path: 'categories/:slug',      element: <Wrap><CategoryPage /></Wrap> },

      // Brands
      { path: 'brands',                element: <Wrap><BrandsPage /></Wrap> },
      { path: 'brands/:slug',          element: <Wrap><ProductListPage /></Wrap> },

      // Search
      { path: 'search',                element: <Wrap><SearchResultsPage /></Wrap> },

      // Cart (public)
      { path: 'cart',                  element: <Wrap><CartPage /></Wrap> },

      // Protected customer routes
      {
        path: 'wishlist',
        element: <ProtectedRoute><Wrap><WishlistPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><Wrap><CheckoutPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'order-confirmation/:id',
        element: <ProtectedRoute><Wrap><OrderConfirmationPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'orders',
        element: <ProtectedRoute><Wrap><OrdersPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'orders/:id',
        element: <ProtectedRoute><Wrap><OrderDetailPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Wrap><ProfilePage /></Wrap></ProtectedRoute>,
      },

      // Static pages
      { path: 'about',   element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'contact', element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'privacy', element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'terms',   element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'help',    element: <Wrap><NotFoundPage /></Wrap> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ── Auth ──────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: 'login',           element: <LoginPage /> },
      { path: 'register',        element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password',  element: <ResetPasswordPage /> },
    ],
  },

  // ── Admin ─────────────────────────────────────────────────────
  {
    path: 'admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true,            element: <Wrap><DashboardPage /></Wrap> },
      { path: 'orders',         element: <Wrap><AdminOrdersPage /></Wrap> },
      { path: 'orders/:id',     element: <Wrap><AdminOrdersPage /></Wrap> },
      { path: 'products',       element: <Wrap><AdminProductsPage /></Wrap> },
      { path: 'products/new',   element: <Wrap><AdminProductsPage /></Wrap> },
      { path: 'products/:id',   element: <Wrap><AdminProductsPage /></Wrap> },
      { path: 'categories',     element: <Wrap><AdminCategoriesPage /></Wrap> },
      { path: 'brands',         element: <Wrap><AdminBrandsPage /></Wrap> },
      { path: 'customers',      element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'customers/:id',  element: <Wrap><AdminCustomerDetailPage /></Wrap> },
      { path: 'inventory',      element: <Wrap><AdminInventoryPage /></Wrap> },
      { path: 'coupons',        element: <Wrap><AdminCouponsPage /></Wrap> },
      { path: 'reviews',        element: <Wrap><AdminReviewsPage /></Wrap> },
      { path: 'analytics',      element: <Wrap><AdminAnalyticsPage /></Wrap> },
      { path: '*',              element: <NotFoundPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}

export default Router
