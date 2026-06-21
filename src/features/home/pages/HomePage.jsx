import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Star, TrendingUp
} from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { cn } from '@/utils/helpers'

const features = [
  { icon: Truck,        title: 'Free Shipping',   description: 'On all orders above ₦50,000. Delivered to your door nationwide.' },
  { icon: ShieldCheck,  title: 'Secure Payments', description: 'Every transaction is encrypted and protected by Paystack.' },
  { icon: RefreshCw,    title: 'Easy Returns',    description: '30-day hassle-free returns on all eligible items.' },
  { icon: Headphones,   title: '24/7 Support',    description: 'Our customer success team is always ready to help.' },
]

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Products' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★',  label: 'Average Rating' },
]

const DEFAULT_CATEGORIES = [
  { name: 'Electronics',   slug: 'electronics',  icon: '💻', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Fashion',       slug: 'fashion',      icon: '👗', color: 'bg-pink-50 dark:bg-pink-900/20' },
  { name: 'Home & Living', slug: 'home-living',  icon: '🏠', color: 'bg-amber-50 dark:bg-amber-900/20' },
  { name: 'Sports',        slug: 'sports',       icon: '⚽', color: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'Beauty',        slug: 'beauty',       icon: '✨', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Books',         slug: 'books',        icon: '📚', color: 'bg-orange-50 dark:bg-orange-900/20' },
]

const ICON_MAP = {
  electronics: '💻', fashion: '👗', 'home-living': '🏠', sports: '⚽',
  beauty: '✨', books: '📚', default: '🛍️',
}
const COLOR_MAP = [
  'bg-blue-50 dark:bg-blue-900/20',   'bg-pink-50 dark:bg-pink-900/20',
  'bg-amber-50 dark:bg-amber-900/20', 'bg-green-50 dark:bg-green-900/20',
  'bg-purple-50 dark:bg-purple-900/20','bg-orange-50 dark:bg-orange-900/20',
]

export function HomePage() {
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  useEffect(() => {
    productService.getFeaturedProducts(8)
      .then(setFeatured)
      .catch(() => {})
      .finally(() => setFeaturedLoading(false))

    categoryService.getAll()
      .then(data => {
        if (data.length) {
          setCategories(data.slice(0, 6).map((c, i) => ({
            ...c,
            icon: ICON_MAP[c.slug] || ICON_MAP.default,
            color: COLOR_MAP[i % COLOR_MAP.length],
          })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <SEO />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-slate-800 to-slate-900">
        <div
          className="absolute inset-0 opacity-5"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="container-base relative py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              New arrivals every week
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Shop the world's{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                best products
              </span>{' '}
              delivered to you
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
              Discover thousands of premium products across every category.
              Fast delivery, easy returns, and unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="primary" size="lg" rightIcon={ArrowRight}>Shop now</Button>
              </Link>
              <Link to="/products?tag=sale">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  View sale items
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-xs text-slate-400">Trusted by 50,000+ customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-primary">
        <div className="container-base py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section">
        <div className="container-base">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Browse by</p>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Popular categories</h2>
            </div>
            <Link to="/categories" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors items-center gap-1 hidden sm:flex">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className={cn(
                  'group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl',
                  'border border-border hover:border-primary/30',
                  'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
                  cat.color
                )}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                  {cat.icon}
                </span>
                <span className="text-sm font-medium text-text-primary text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="section bg-surface">
        <div className="container-base">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Hand-picked</p>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Featured products</h2>
            </div>
            <Link to="/products?featured=true" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors items-center gap-1 hidden sm:flex">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid
            products={featured}
            loading={featuredLoading}
          />
          {!featuredLoading && featured.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm mb-4">
                No featured products yet. Add products in the admin panel and mark them as featured.
              </p>
              <Link to="/products">
                <Button variant="outline" size="sm">Browse all products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="container-base">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Why choose us</p>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Shopping made effortless</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section">
        <div className="container-base">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-accent p-8 md:p-12 text-white text-center md:text-left md:flex md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Get 10% off your first order</h2>
              <p className="text-blue-100">Sign up now and use code <strong>WELCOME10</strong> at checkout.</p>
            </div>
            <div className="mt-6 md:mt-0 shrink-0">
              <Link to="/register">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" rightIcon={ArrowRight}>
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
