import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SEO } from '@/components/shared/SEO'
import { RegisterForm } from '../components/RegisterForm'
import { useAuthStore } from '@/store/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { user, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && user) navigate('/', { replace: true })
  }, [user, initialized, navigate])

  return (
    <>
      <SEO title="Create Account" noIndex />
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Create your account</h1>
          <p className="text-text-secondary text-sm">
            Join thousands of happy shoppers
          </p>
        </div>

        <div className="card">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary font-medium hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}

export default RegisterPage
