import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AdminRoute } from '@/components/shared/AdminRoute'

// Layouts
import CustomerLayout from '@/components/layout/CustomerLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Eager-load home and auth (critical path)
import HomePage from '@/features/home/pages/HomePage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import NotFoundPage from '@/features/home/pages/NotFoundPage'

// Lazy-load everything else
const ProductListPage    = lazy(() => import('@/features/products/pages/ProductListPage'))
const CartPage           = lazy(() => import('@/features/cart/pages/CartPage'))
const WishlistPage       = lazy(() => import('@/features/wishlist/pages/WishlistPage'))
const ProfilePage        = lazy(() => import('@/features/profile/pages/ProfilePage'))
const OrdersPage         = lazy(() => import('@/features/orders/pages/OrdersPage'))
const DashboardPage      = lazy(() => import('@/features/admin/pages/DashboardPage'))

// Lazy admin stubs (placeholder pages for future phases)
const AdminOrdersPage    = lazy(() => import('@/features/admin/pages/DashboardPage'))
const AdminProductsPage  = lazy(() => import('@/features/admin/pages/DashboardPage'))
const AdminCustomersPage = lazy(() => import('@/features/admin/pages/DashboardPage'))

const Wrap = ({ children }) => (
  <Suspense fallback={<PageSpinner />}>{children}</Suspense>
)

const router = createBrowserRouter([
  // ── Customer / Storefront ──
  {
    element: <CustomerLayout />,
    errorElement: <ErrorBoundary><NotFoundPage /></ErrorBoundary>,
    children: [
      { index: true, element: <HomePage /> },

      // Products (Phase 2)
      { path: 'products',         element: <Wrap><ProductListPage /></Wrap> },
      { path: 'products/:slug',   element: <Wrap><ProductListPage /></Wrap> },
      { path: 'categories',       element: <Wrap><ProductListPage /></Wrap> },
      { path: 'categories/:slug', element: <Wrap><ProductListPage /></Wrap> },
      { path: 'brands',           element: <Wrap><ProductListPage /></Wrap> },
      { path: 'brands/:slug',     element: <Wrap><ProductListPage /></Wrap> },
      { path: 'search',           element: <Wrap><ProductListPage /></Wrap> },

      // Cart
      { path: 'cart', element: <Wrap><CartPage /></Wrap> },

      // Wishlist (requires auth)
      {
        path: 'wishlist',
        element: <ProtectedRoute><Wrap><WishlistPage /></Wrap></ProtectedRoute>,
      },

      // Checkout (Phase 3–4) — protected
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Wrap>
              <div className="container-base py-16 text-center">
                <p className="text-text-secondary">Checkout coming in Phase 3</p>
              </div>
            </Wrap>
          </ProtectedRoute>
        ),
      },

      // Order confirmation (Phase 4)
      { path: 'order-confirmation/:id', element: <Wrap><OrdersPage /></Wrap> },

      // Customer account (protected)
      {
        path: 'orders',
        element: <ProtectedRoute><Wrap><OrdersPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'orders/:id',
        element: <ProtectedRoute><Wrap><OrdersPage /></Wrap></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Wrap><ProfilePage /></Wrap></ProtectedRoute>,
      },

      // Static pages
      { path: 'about',    element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'contact',  element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'privacy',  element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'terms',    element: <Wrap><NotFoundPage /></Wrap> },
      { path: 'help',     element: <Wrap><NotFoundPage /></Wrap> },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ── Auth ──
  {
    element: <AuthLayout />,
    children: [
      { path: 'login',            element: <LoginPage /> },
      { path: 'register',         element: <RegisterPage /> },
      { path: 'forgot-password',  element: <ForgotPasswordPage /> },
      { path: 'reset-password',   element: <ResetPasswordPage /> },
    ],
  },

  // ── Admin ──
  {
    path: 'admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true,          element: <Wrap><DashboardPage /></Wrap> },
      { path: 'orders',       element: <Wrap><AdminOrdersPage /></Wrap> },
      { path: 'orders/:id',   element: <Wrap><AdminOrdersPage /></Wrap> },
      { path: 'products',     element: <Wrap><AdminProductsPage /></Wrap> },
      { path: 'products/new', element: <Wrap><AdminProductsPage /></Wrap> },
      { path: 'products/:id', element: <Wrap><AdminProductsPage /></Wrap> },
      { path: 'categories',   element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'brands',       element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'customers',    element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'customers/:id',element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'inventory',    element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'coupons',      element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'reviews',      element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: 'analytics',    element: <Wrap><AdminCustomersPage /></Wrap> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}

export default Router
