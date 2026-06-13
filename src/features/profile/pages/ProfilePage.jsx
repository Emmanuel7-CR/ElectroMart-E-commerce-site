import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Phone, Lock, Camera, Save } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { profileSchema } from '@/utils/validation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'

export function ProfilePage() {
  const { user, profile, fetchProfile } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          phone: values.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
      await fetchProfile(user.id)
      toastSuccess('Profile updated successfully')
    } catch (err) {
      setServerError(err.message || 'Failed to update profile')
      toastError('Failed to update profile')
    }
  }

  return (
    <>
      <SEO title="Account Settings" noIndex />
      <div className="container-base py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
          <p className="text-text-secondary mt-1">Manage your profile and account preferences</p>
        </div>

        {/* Avatar section */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-hover transition-colors"
                aria-label="Change avatar"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-text-primary">{profile?.full_name || 'Your Name'}</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              <p className="text-xs text-text-muted mt-0.5 capitalize">
                {profile?.role || 'Customer'} account
              </p>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="card mb-6">
          <h2 className="text-base font-semibold text-text-primary mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Personal Information
          </h2>

          {serverError && (
            <Alert variant="error" className="mb-4" onDismiss={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              leftIcon={User}
              required
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Phone number"
              type="tel"
              placeholder="+234 800 000 0000"
              leftIcon={Phone}
              error={errors.phone?.message}
              hint="Optional. Used for order updates."
              {...register('phone')}
            />

            <Input
              label="Email address"
              type="email"
              value={user?.email || ''}
              leftIcon={Mail}
              disabled
              hint="Contact support to change your email address."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={!isDirty}
                leftIcon={Save}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>

        {/* Security section */}
        <div className="card">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Security
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Last sign-in: {new Date(user?.last_sign_in_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/forgot-password'}
          >
            Change password
          </Button>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
