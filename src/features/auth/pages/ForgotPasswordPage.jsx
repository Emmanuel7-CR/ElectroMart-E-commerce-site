import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <>
      <SEO title="Reset Password" noIndex />
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Reset your password</h1>
          <p className="text-text-secondary text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="card">
          <ForgotPasswordForm />
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage
