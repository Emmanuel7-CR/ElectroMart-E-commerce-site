import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Phone, Mail, Lock, Camera, Save, MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AddressForm } from '@/features/checkout/components/AddressForm'
import { profileSchema } from '@/utils/validation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/helpers'

const TABS = ['Profile', 'Addresses', 'Security']

export function ProfilePage() {
  const { user, profile, fetchProfile } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()
  const [activeTab, setActiveTab] = useState('Profile')
  const [serverError, setServerError] = useState('')

  // Address state
  const [addresses, setAddresses] = useState([])
  const [addrLoading, setAddrLoading] = useState(false)
  const [addrModalOpen, setAddrModalOpen] = useState(false)
  const [editAddress, setEditAddress] = useState(null)

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name || '', phone: profile?.phone || '' },
  })

  // Load addresses
  const loadAddresses = () => {
    if (!user) return
    setAddrLoading(true)
    supabase.from('addresses').select('*').eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => setAddresses(data || []))
      .catch(() => {})
      .finally(() => setAddrLoading(false))
  }

  useEffect(() => { if (activeTab === 'Addresses') loadAddresses() }, [activeTab, user])

  // Profile update
  const onSubmitProfile = async (values) => {
    setServerError('')
    try {
      const { error } = await supabase.from('profiles')
        .update({ full_name: values.full_name, phone: values.phone || null, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
      await fetchProfile(user.id)
      toastSuccess('Profile updated')
    } catch (err) {
      setServerError(err.message || 'Failed to update')
      toastError('Update failed')
    }
  }

  // Address actions
  const handleSaveAddress = async (data) => {
    try {
      if (editAddress) {
        const { error } = await supabase.from('addresses').update(data).eq('id', editAddress.id)
        if (error) throw error
        toastSuccess('Address updated')
      } else {
        const { error } = await supabase.from('addresses').insert({ ...data, user_id: user.id })
        if (error) throw error
        toastSuccess('Address added')
      }
      setAddrModalOpen(false)
      setEditAddress(null)
      loadAddresses()
    } catch (err) {
      toastError(err.message || 'Failed to save address')
      throw err
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
      toastSuccess('Address removed')
      loadAddresses()
    } catch (err) {
      toastError(err.message)
    }
  }

  const handleSetDefault = async (id) => {
    try {
      // Clear all defaults first
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      await supabase.from('addresses').update({ is_default: true }).eq('id', id)
      toastSuccess('Default address updated')
      loadAddresses()
    } catch (err) {
      toastError(err.message)
    }
  }

  return (
    <>
      <SEO title="Account Settings" noIndex />
      <div className="container-base py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-hover transition-colors" aria-label="Change avatar">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{profile?.full_name || 'Your Account'}</h1>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            <p className="text-xs text-text-muted mt-0.5 capitalize">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'Profile' && (
          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </h2>
            {serverError && (
              <Alert variant="error" className="mb-4" onDismiss={() => setServerError('')}>
                {serverError}
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmitProfile)} noValidate className="space-y-4">
              <Input
                label="Full name" type="text" placeholder="Jane Smith"
                leftIcon={User} required error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Phone number" type="tel" placeholder="+234 800 000 0000"
                leftIcon={Phone} error={errors.phone?.message}
                hint="Optional. Used for order updates."
                {...register('phone')}
              />
              <Input
                label="Email address" type="email" value={user?.email || ''}
                leftIcon={Mail} disabled
                hint="Contact support to change your email address."
              />
              <div className="pt-2">
                <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty} leftIcon={Save}>
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {activeTab === 'Addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Saved Addresses
              </h2>
              <Button
                variant="primary" size="sm" leftIcon={Plus}
                onClick={() => { setEditAddress(null); setAddrModalOpen(true) }}
              >
                Add address
              </Button>
            </div>

            {addrLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-border animate-pulse" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="card text-center py-12">
                <MapPin className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="font-medium text-text-primary mb-1">No addresses saved</p>
                <p className="text-sm text-text-secondary mb-4">Add an address for faster checkout.</p>
                <Button variant="outline" size="sm" leftIcon={Plus} onClick={() => { setEditAddress(null); setAddrModalOpen(true) }}>
                  Add your first address
                </Button>
              </div>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className={cn(
                  'card border-2 transition-all',
                  addr.is_default ? 'border-primary/40 bg-primary/5' : 'border-border'
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-text-primary">{addr.full_name}</p>
                        {addr.label && (
                          <span className="px-2 py-0.5 bg-border rounded-full text-xs text-text-muted">{addr.label}</span>
                        )}
                        {addr.is_default && (
                          <Badge variant="info">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {addr.city}, {addr.state}, {addr.country}
                      </p>
                      <p className="text-sm text-text-secondary">{addr.phone}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-success hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Set as default"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditAddress(addr); setAddrModalOpen(true) }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-border transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === 'Security' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Password & Security
              </h2>
              <div className="space-y-3 text-sm text-text-secondary mb-5">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Email</span>
                  <span className="font-medium text-text-primary">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Last sign-in</span>
                  <span className="font-medium text-text-primary">
                    {user?.last_sign_in_at ? formatDate(user.last_sign_in_at, 'MMM d, yyyy · h:mm a') : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-text-secondary">Account role</span>
                  <Badge variant={profile?.role === 'super_admin' || profile?.role === 'admin' ? 'info' : 'neutral'}>
                    {profile?.role || 'customer'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline" size="sm"
                onClick={() => window.location.href = '/forgot-password'}
                leftIcon={Lock}
              >
                Change password
              </Button>
            </div>

            <div className="card border-danger/20">
              <h3 className="text-sm font-semibold text-danger mb-2">Danger Zone</h3>
              <p className="text-xs text-text-secondary mb-3">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
              <Button variant="danger" size="sm" onClick={() => toastError('Please contact support to delete your account.')}>
                Delete account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Address modal */}
      <Modal
        open={addrModalOpen}
        onClose={() => { setAddrModalOpen(false); setEditAddress(null) }}
        title={editAddress ? 'Edit address' : 'Add new address'}
        size="lg"
      >
        <AddressForm
          defaultValues={editAddress || { full_name: profile?.full_name || '', phone: profile?.phone || '' }}
          onSubmit={handleSaveAddress}
          submitLabel={editAddress ? 'Update address' : 'Save address'}
        />
      </Modal>
    </>
  )
}

export default ProfilePage
