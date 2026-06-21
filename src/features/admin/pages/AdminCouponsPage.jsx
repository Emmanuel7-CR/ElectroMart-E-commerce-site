import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Ticket } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SEO } from '@/components/shared/SEO'
import { AdminModal } from '../components/AdminModal'
import { DataTable } from '../components/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { adminService } from '@/services/adminService'
import { couponSchema } from '@/utils/validation'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { useUIStore } from '@/store/uiStore'

const TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed amount (₦)' },
  { value: 'free_shipping', label: 'Free shipping' },
]

function CouponForm({ coupon, onSave, onCancel }) {
  const { toastSuccess, toastError } = useUIStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || '', description: coupon?.description || '',
      type: coupon?.type || 'percentage', value: coupon?.value || '',
      min_order_amount: coupon?.min_order_amount || 0,
      max_uses: coupon?.max_uses || '', is_active: coupon?.is_active ?? true,
      starts_at: coupon?.starts_at?.slice(0,16) || '', expires_at: coupon?.expires_at?.slice(0,16) || '',
    },
  })
  const type = watch('type')

  const onSubmit = async (data) => {
    setError('')
    try {
      const payload = { ...data, value: Number(data.value), min_order_amount: Number(data.min_order_amount), max_uses: data.max_uses ? Number(data.max_uses) : null, starts_at: data.starts_at || null, expires_at: data.expires_at || null }
      coupon ? await adminService.updateCoupon(coupon.id, payload) : await adminService.createCoupon(payload)
      toastSuccess(coupon ? 'Coupon updated' : 'Coupon created')
      onSave?.()
    } catch (err) { setError(err.message); toastError('Failed to save') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Coupon code" placeholder="e.g. SAVE20" required error={errors.code?.message} {...register('code')} />
        <Select label="Type" options={TYPE_OPTIONS} required error={errors.type?.message} {...register('type')} />
      </div>
      <Input label="Description" placeholder="Internal note" {...register('description')} />
      <div className="grid grid-cols-2 gap-4">
        {type !== 'free_shipping' && (
          <Input label={type === 'percentage' ? 'Discount %' : 'Discount amount (₦)'} type="number" step="0.01" min="0.01" required error={errors.value?.message} {...register('value')} />
        )}
        <Input label="Min order amount (₦)" type="number" min="0" {...register('min_order_amount')} />
        <Input label="Max uses (blank = unlimited)" type="number" min="1" {...register('max_uses')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start date" type="datetime-local" {...register('starts_at')} />
        <Input label="Expiry date" type="datetime-local" {...register('expires_at')} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" {...register('is_active')} />
        <span className="text-sm text-text-secondary">Active</span>
      </label>
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>{coupon ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const { toastSuccess, toastError, openConfirm, closeConfirm } = useUIStore()

  const load = () => { setLoading(true); adminService.getCoupons().then(setCoupons).catch(()=>{}).finally(()=>setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleDelete = (coupon) => {
    openConfirm({ title: 'Delete coupon', message: `Delete coupon "${coupon.code}"?`, confirmLabel: 'Delete', variant: 'danger',
      onConfirm: async () => { try { await adminService.deleteCoupon(coupon.id); toastSuccess('Deleted'); load() } catch(e){ toastError(e.message) } finally { closeConfirm() } },
    })
  }

  const columns = [
    { key: 'code', label: 'Code', render: v => <code className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{v}</code> },
    { key: 'type', label: 'Type', render: v => <span className="capitalize text-text-secondary">{v.replace('_',' ')}</span> },
    { key: 'value', label: 'Value', render: (v, row) => row.type === 'percentage' ? `${v}%` : row.type === 'fixed' ? formatCurrency(v) : 'Free shipping' },
    { key: 'used_count', label: 'Uses', render: (v, row) => `${v}${row.max_uses ? ` / ${row.max_uses}` : ''}` },
    { key: 'expires_at', label: 'Expires', render: v => v ? formatDate(v) : 'Never' },
    { key: 'is_active', label: 'Status', render: v => <Badge variant={v ? 'success' : 'neutral'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', label: '', className: 'w-20', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => { setEditCoupon(row); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ]

  return (
    <>
      <SEO title="Coupons — Admin" noIndex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-text-primary">Coupons</h1><p className="text-sm text-text-secondary mt-0.5">{coupons.length} coupons</p></div>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => { setEditCoupon(null); setModalOpen(true) }}>Add coupon</Button>
        </div>
        <div className="card p-0 overflow-hidden">
          <DataTable columns={columns} data={coupons} loading={loading} emptyIcon={Ticket} emptyTitle="No coupons yet" />
        </div>
      </div>
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editCoupon ? 'Edit coupon' : 'New coupon'} size="md">
        <CouponForm coupon={editCoupon} onSave={() => { setModalOpen(false); load() }} onCancel={() => setModalOpen(false)} />
      </AdminModal>
      {useUIStore.getState().confirmModal && (
        <AdminModal open onClose={() => useUIStore.getState().closeConfirm()} title={useUIStore.getState().confirmModal.title} size="sm">
          <p className="text-sm text-text-secondary mb-5">{useUIStore.getState().confirmModal.message}</p>
          <div className="flex gap-3">
            <Button variant="danger" size="sm" onClick={useUIStore.getState().confirmModal.onConfirm}>Delete</Button>
            <Button variant="outline" size="sm" onClick={() => useUIStore.getState().closeConfirm()}>Cancel</Button>
          </div>
        </AdminModal>
      )}
    </>
  )
}

export default AdminCouponsPage
