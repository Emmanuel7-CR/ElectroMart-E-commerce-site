import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, Globe, Send, Rss } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Sale', href: '/products?tag=sale' },
    { label: 'Categories', href: '/categories' },
    { label: 'Brands', href: '/brands' },
  ],
  Account: [
    { label: 'My Account', href: '/profile' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Sign In', href: '/login' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Returns', href: '/returns' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-secondary text-white mt-auto" role="contentinfo">
      <div className="container-base py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              {APP_NAME}
            </Link>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Premium products, exceptional quality. Your trusted online shopping destination.
            </p>
            <div className="flex items-center gap-3">
              {[Send, Rss, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={Icon.name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4 text-white">{category}</h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {['Visa', 'Mastercard', 'Paystack'].map(p => (
              <span
                key={p}
                className="px-2 py-1 bg-white/10 rounded text-2xs font-medium text-slate-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
