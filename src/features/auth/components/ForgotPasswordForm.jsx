import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { forgotPasswordSchema } from '@/utils/validation'
import { authService } from '@/services/authService'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async ({ email }) => {
    setServerError('')
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setServerError(err.message || 'Failed to send reset email. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Check your inbox</h3>
        <p className="text-sm text-text-secondary mb-6">
          We sent a password reset link to <strong>{getValues('email')}</strong>.
          It expires in 1 hour.
        </p>
        <p className="text-xs text-text-muted">
          Didn't receive it? Check your spam folder or{' '}
          <button
            onClick={() => setSent(false)}
            className="text-primary hover:underline font-medium"
          >
            try again
          </button>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <Alert variant="error" onDismiss={() => setServerError('')}>
          {serverError}
        </Alert>
      )}

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        leftIcon={Mail}
        autoComplete="email"
        required
        error={errors.email?.message}
        hint="We'll send a reset link to this address."
        {...register('email')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        Send reset link
      </Button>
    </form>
  )
}

export default ForgotPasswordForm
