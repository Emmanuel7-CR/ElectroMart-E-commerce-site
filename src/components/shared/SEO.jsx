import { useEffect } from 'react'
import { APP_NAME, APP_URL } from '@/utils/constants'

export function SEO({ title, description = 'Premium products, exceptional quality. Your trusted online shopping destination.', image, noIndex = false, type = 'website', product, breadcrumbs }) {
  const fullTitle = title ? `${title} — ${APP_NAME}` : APP_NAME
  const canonicalUrl = typeof window !== 'undefined' ? window.location.href : APP_URL

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.querySelector(selector)
      if (!el) { el = document.createElement('meta'); property ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`)
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
      el.setAttribute('href', href)
    }

    const setJsonLd = (id, data) => {
      let el = document.querySelector(`script[data-ld="${id}"]`)
      if (!el) { el = document.createElement('script'); el.setAttribute('type', 'application/ld+json'); el.setAttribute('data-ld', id); document.head.appendChild(el) }
      el.textContent = JSON.stringify(data)
    }

    if (description) setMeta('description', description)
    setMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow')
    setLink('canonical', canonicalUrl)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:type', type, true)
    setMeta('og:url', canonicalUrl, true)
    setMeta('og:site_name', APP_NAME, true)
    if (image) setMeta('og:image', image, true)
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', fullTitle)
    if (description) setMeta('twitter:description', description)
    if (image) setMeta('twitter:image', image)

    setJsonLd('organization', { '@context': 'https://schema.org', '@type': 'Organization', name: APP_NAME, url: APP_URL })

    if (product) {
      setJsonLd('product', {
        '@context': 'https://schema.org', '@type': 'Product',
        name: product.name, description: product.description,
        image: product.images?.map(i => i.url) || (product.primaryImage ? [product.primaryImage] : []),
        sku: product.sku,
        brand: product.brands ? { '@type': 'Brand', name: product.brands.name } : undefined,
        offers: { '@type': 'Offer', price: product.price, priceCurrency: 'NGN', availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: canonicalUrl },
        ...(product.avgRating > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.avgRating, reviewCount: product.reviewCount } } : {}),
      })
    }

    if (breadcrumbs?.length) {
      setJsonLd('breadcrumb', {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: c.href ? `${APP_URL}${c.href}` : undefined })),
      })
    }

    return () => { document.title = APP_NAME }
  }, [fullTitle, description, image, noIndex, type, canonicalUrl])

  return null
}

export default SEO
