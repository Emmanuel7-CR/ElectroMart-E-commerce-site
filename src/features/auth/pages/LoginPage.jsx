import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SEO } from '@/components/shared/SEO'
import { LoginForm } from '../components/LoginForm'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, initialized } = useAuthStore()
  const from = location.state?.from?.pathname || '/'

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) navigate(from, { replace: true })
  }, [user, initialized, navigate, from])

  const handleSuccess = () => {
    navigate(from, { replace: true })
  }

  return (
    <>
      <SEO title="Sign In" noIndex />
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h1>
          <p className="text-text-secondary text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <div className="card">
          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-primary font-medium hover:text-primary-hover transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </>
  )
}

export default LoginPage
