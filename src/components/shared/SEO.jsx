import { useEffect } from 'react'
import { APP_NAME } from '@/utils/constants'

export function SEO({
  title,
  description = 'Premium products, exceptional quality. Your trusted online shopping destination.',
  image,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} — ${APP_NAME}` : APP_NAME

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (name, content, property = false) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (property) el.setAttribute('property', name)
        else el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) setMeta('description', description)
    if (noIndex) setMeta('robots', 'noindex,nofollow')

    // Open Graph
    setMeta('og:title', fullTitle, true)
    if (description) setMeta('og:description', description, true)
    if (image) setMeta('og:image', image, true)
    setMeta('og:type', 'website', true)

    return () => {
      document.title = APP_NAME
    }
  }, [fullTitle, description, image, noIndex])

  return null
}

export default SEO
