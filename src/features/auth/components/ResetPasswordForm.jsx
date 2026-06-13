import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { resetPasswordSchema } from '@/utils/validation'
import { authService } from '@/services/authService'
import { useUIStore } from '@/store/uiStore'

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()
  const { toastSuccess } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async ({ password }) => {
    setServerError('')
    try {
      await authService.resetPassword(password)
      toastSuccess('Password updated successfully!')
      navigate('/login')
    } catch (err) {
      setServerError(err.message || 'Failed to update password. The link may have expired.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <Alert variant="error" onDismiss={() => setServerError('')}>
          {serverError}
        </Alert>
      )}

      <Input
        label="New password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Min. 8 characters"
        leftIcon={Lock}
        autoComplete="new-password"
        required
        error={errors.password?.message}
        hint="Must contain at least one uppercase letter and number"
        {...register('password')}
      />

      <Input
        label="Confirm new password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Repeat your new password"
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
        Update password
      </Button>
    </form>
  )
}

export default ResetPasswordForm
