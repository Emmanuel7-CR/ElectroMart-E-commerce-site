import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Phone, MapPin, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { addressSchema } from '@/utils/validation'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
].map(s => ({ value: s, label: s }))

export function AddressForm({ defaultValues = {}, onSubmit, submitLabel = 'Save address', loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'NG',
      postal_code: '',
      is_default: false,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Label / nickname */}
      <Input
        label="Address label (optional)"
        placeholder="e.g. Home, Office"
        error={errors.label?.message}
        {...register('label')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full name"
          placeholder="Recipient's full name"
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
          required
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <Input
        label="Address line 1"
        placeholder="Street address, P.O. box"
        leftIcon={MapPin}
        required
        error={errors.address_line1?.message}
        {...register('address_line1')}
      />

      <Input
        label="Address line 2 (optional)"
        placeholder="Apartment, suite, unit, building"
        leftIcon={Building2}
        error={errors.address_line2?.message}
        {...register('address_line2')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="City"
          required
          error={errors.city?.message}
          {...register('city')}
        />
        <Select
          label="State"
          placeholder="Select state"
          options={NIGERIAN_STATES}
          required
          error={errors.state?.message}
          {...register('state')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Country"
          options={[{ value: 'NG', label: 'Nigeria' }]}
          error={errors.country?.message}
          {...register('country')}
        />
        <Input
          label="Postal code (optional)"
          placeholder="e.g. 100001"
          error={errors.postal_code?.message}
          {...register('postal_code')}
        />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          {...register('is_default')}
        />
        <span className="text-sm text-text-secondary">Set as default address</span>
      </label>

      <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  )
}

export default AddressForm
