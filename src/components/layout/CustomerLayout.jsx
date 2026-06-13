import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default CustomerLayout
