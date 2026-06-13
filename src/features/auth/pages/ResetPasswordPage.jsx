import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '@/components/shared/SEO'
import { ResetPasswordForm } from '../components/ResetPasswordForm'
import { Alert } from '@/components/ui/Alert'
import { supabase } from '@/lib/supabase'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  // Supabase delivers the session via hash fragment on this page
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      } else if (event === 'SIGNED_IN' && ready) {
        // Already handled
      }
    })

    // Fallback: if no PASSWORD_RECOVERY event fires within 3s, show error
    const timer = setTimeout(() => {
      if (!ready) setError('This reset link is invalid or has expired. Please request a new one.')
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [ready])

  return (
    <>
      <SEO title="Set New Password" noIndex />
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Set new password</h1>
          <p className="text-text-secondary text-sm">
            Choose a strong password for your account
          </p>
        </div>

        <div className="card">
          {error ? (
            <div className="space-y-4">
              <Alert variant="error">{error}</Alert>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full btn-md btn-primary"
              >
                Request new link
              </button>
            </div>
          ) : ready ? (
            <ResetPasswordForm />
          ) : (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Verifying reset link…</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ResetPasswordPage
