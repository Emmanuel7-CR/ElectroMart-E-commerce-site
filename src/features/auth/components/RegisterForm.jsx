import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { registerSchema } from '@/utils/validation'
import { authService } from '@/services/authService'

export function RegisterForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      await authService.register({
        email: values.email,
        password: values.password,
        full_name: values.full_name,
      })
      setEmailSent(true)
      onSuccess?.({ emailSent: true, email: values.email })
    } catch (err) {
      setServerError(
        err.message?.includes('already registered')
          ? 'An account with this email already exists. Try signing in instead.'
          : err.message || 'Registration failed. Please try again.'
      )
    }
  }

  if (emailSent) {
    return (
      <Alert variant="success" title="Check your email">
        We've sent you a confirmation link. Click it to activate your account and start shopping.
      </Alert>
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
        label="Full name"
        type="text"
        placeholder="Jane Smith"
        leftIcon={User}
        autoComplete="name"
        required
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        leftIcon={Mail}
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Min. 8 characters"
        leftIcon={Lock}
        autoComplete="new-password"
        required
        error={errors.password?.message}
        hint="Must contain uppercase letter and number"
        {...register('password')}
      />

      <Input
        label="Confirm password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Repeat your password"
        leftIcon={Lock}
        autoComplete="new-password"
        required
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <button
        type="button"
        onClick={() => setShowPassword(v => !v)}
        className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
      >
        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {showPassword ? 'Hide' : 'Show'} passwords
      </button>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        Create account
      </Button>

      <p className="text-xs text-text-muted text-center">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">Terms</a> and{' '}
        <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
      </p>
    </form>
  )
}

export default RegisterForm
