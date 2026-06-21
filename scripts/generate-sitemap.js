// scripts/generate-sitemap.js
// Run: node scripts/generate-sitemap.js
// Generates public/sitemap.xml from your live Supabase data

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const APP_URL = process.env.VITE_APP_URL || 'https://yourdomain.com'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function url(loc, { lastmod, changefreq = 'weekly', priority = '0.7' } = {}) {
  return `  <url>
    <loc>${APP_URL}${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function generate() {
  const urls = []

  // Static pages
  urls.push(url('/', { changefreq: 'daily', priority: '1.0' }))
  urls.push(url('/products', { changefreq: 'daily', priority: '0.9' }))
  urls.push(url('/categories', { changefreq: 'weekly', priority: '0.8' }))
  urls.push(url('/brands', { changefreq: 'weekly', priority: '0.7' }))

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)
  for (const cat of categories || []) {
    urls.push(url(`/categories/${cat.slug}`, { lastmod: cat.updated_at, priority: '0.8' }))
  }

  // Brands
  const { data: brands } = await supabase
    .from('brands')
    .select('slug, updated_at')
    .eq('is_active', true)
  for (const brand of brands || []) {
    urls.push(url(`/brands/${brand.slug}`, { lastmod: brand.updated_at, priority: '0.7' }))
  }

  // Products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active')
  for (const product of products || []) {
    urls.push(url(`/products/${product.slug}`, { lastmod: product.updated_at, priority: '0.9' }))
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  writeFileSync('public/sitemap.xml', sitemap)
  console.log(`✅ Sitemap generated with ${urls.length} URLs → public/sitemap.xml`)
}

generate().catch(console.error)
