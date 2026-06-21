import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { SearchModal } from '@/features/search/components/SearchModal'

export function CustomerLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* These need to be inside RouterProvider to use <Link> */}
      <CartDrawer />
      <SearchModal />
    </div>
  )
}

export default CustomerLayout
