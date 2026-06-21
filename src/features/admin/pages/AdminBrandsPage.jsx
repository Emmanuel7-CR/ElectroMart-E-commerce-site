import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Award } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { SEO } from '@/components/shared/SEO'
import { AdminModal } from '../components/AdminModal'
import { DataTable } from '../components/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { adminService } from '@/services/adminService'
import { slugify } from '@/utils/helpers'
import { useUIStore } from '@/store/uiStore'

function BrandForm({ brand, onSave, onCancel }) {
  const { toastSuccess, toastError } = useUIStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: brand?.name||'', slug: brand?.slug||'', description: brand?.description||'', website_url: brand?.website_url||'', is_active: brand?.is_active??true },
  })
  const name = watch('name')
  useEffect(() => { if (!brand && name) setValue('slug', slugify(name)) }, [name, brand, setValue])

  const onSubmit = async (data) => {
    setError('')
    try {
      brand ? await adminService.updateBrand(brand.id, data) : await adminService.createBrand(data)
      toastSuccess(brand ? 'Brand updated' : 'Brand created')
      onSave?.()
    } catch (err) { setError(err.message); toastError('Failed to save') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Brand name" required {...register('name', { required: 'Required' })} error={errors.name?.message} />
        <Input label="Slug" required {...register('slug', { required: 'Required' })} error={errors.slug?.message} />
      </div>
      <Textarea label="Description" rows={2} {...register('description')} />
      <Input label="Website URL" type="url" placeholder="https://brand.com" {...register('website_url')} />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" {...register('is_active')} />
        <span className="text-sm text-text-secondary">Active</span>
      </label>
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>{brand ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export function AdminBrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBrand, setEditBrand] = useState(null)
  const { toastSuccess, toastError, openConfirm, closeConfirm } = useUIStore()

  const load = () => { setLoading(true); adminService.getBrands().then(setBrands).catch(()=>{}).finally(()=>setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleDelete = (brand) => {
    openConfirm({ title: 'Delete brand', message: `Delete "${brand.name}"?`, confirmLabel: 'Delete', variant: 'danger',
      onConfirm: async () => { try { await adminService.deleteBrand(brand.id); toastSuccess('Deleted'); load() } catch(e){ toastError(e.message) } finally { closeConfirm() } },
    })
  }

  const columns = [
    { key: 'name', label: 'Brand', sortable: true, render: (v, row) => (
      <div className="flex items-center gap-3">
        {row.logo_url ? <img src={row.logo_url} alt={v} className="w-8 h-8 object-contain rounded" /> : <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{v[0]}</div>}
        <span className="font-medium text-text-primary">{v}</span>
      </div>
    )},
    { key: 'slug', label: 'Slug', render: v => <code className="text-xs bg-background px-1.5 py-0.5 rounded">{v}</code> },
    { key: 'website_url', label: 'Website', render: v => v ? <a href={v} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block max-w-[180px]">{v}</a> : '—' },
    { key: 'is_active', label: 'Status', render: v => <Badge variant={v ? 'success' : 'neutral'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', label: '', className: 'w-20', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => { setEditBrand(row); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ]

  return (
    <>
      <SEO title="Brands — Admin" noIndex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-text-primary">Brands</h1><p className="text-sm text-text-secondary mt-0.5">{brands.length} brands</p></div>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => { setEditBrand(null); setModalOpen(true) }}>Add brand</Button>
        </div>
        <div className="card p-0 overflow-hidden">
          <DataTable columns={columns} data={brands} loading={loading} emptyIcon={Award} emptyTitle="No brands yet" />
        </div>
      </div>
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editBrand ? 'Edit brand' : 'New brand'} size="md">
        <BrandForm brand={editBrand} onSave={() => { setModalOpen(false); load() }} onCancel={() => setModalOpen(false)} />
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

export default AdminBrandsPage
