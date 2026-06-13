import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" noIndex />
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <p className="text-8xl font-black text-border mb-4" aria-hidden="true">404</p>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => window.history.back()}
              leftIcon={ArrowLeft}
            >
              Go back
            </Button>
            <Link to="/">
              <Button variant="primary" size="md" leftIcon={Home}>
                Go home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage
