import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { SEO } from '@/components/shared/SEO'
import { AdminModal } from '../components/AdminModal'
import { DataTable } from '../components/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { adminService } from '@/services/adminService'
import { slugify } from '@/utils/helpers'
import { useUIStore } from '@/store/uiStore'

function CategoryForm({ cat, categories, onSave, onCancel }) {
  const { toastSuccess, toastError } = useUIStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: cat?.name || '', slug: cat?.slug || '', description: cat?.description || '',
      parent_id: cat?.parent_id || '', sort_order: cat?.sort_order ?? 0, is_active: cat?.is_active ?? true,
    },
  })
  const name = watch('name')
  useEffect(() => { if (!cat && name) setValue('slug', slugify(name)) }, [name, cat, setValue])

  const onSubmit = async (data) => {
    setError('')
    try {
      const payload = { ...data, parent_id: data.parent_id || null, sort_order: Number(data.sort_order) }
      cat ? await adminService.updateCategory(cat.id, payload) : await adminService.createCategory(payload)
      toastSuccess(cat ? 'Category updated' : 'Category created')
      onSave?.()
    } catch (err) { setError(err.message); toastError('Failed to save') }
  }

  const parentOptions = [
    { value: '', label: 'No parent (top level)' },
    ...categories.filter(c => c.id !== cat?.id).map(c => ({ value: c.id, label: c.name })),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
        <Input label="Slug" required error={errors.slug?.message} {...register('slug', { required: 'Required' })} />
      </div>
      <Textarea label="Description" rows={2} {...register('description')} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Parent category" options={parentOptions} {...register('parent_id')} />
        <Input label="Sort order" type="number" {...register('sort_order')} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" {...register('is_active')} />
        <span className="text-sm text-text-secondary">Active</span>
      </label>
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>{cat ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const { toastSuccess, toastError, openConfirm, closeConfirm } = useUIStore()

  const load = () => { setLoading(true); adminService.getCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleDelete = (cat) => {
    openConfirm({
      title: 'Delete category', message: `Delete "${cat.name}"? Products in this category will be unassigned.`,
      confirmLabel: 'Delete', variant: 'danger',
      onConfirm: async () => { try { await adminService.deleteCategory(cat.id); toastSuccess('Deleted'); load() } catch(e){ toastError(e.message) } finally { closeConfirm() } },
    })
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
      <div><p className="font-medium text-text-primary">{v}</p>{row.parent?.name && <p className="text-xs text-text-muted">↳ {row.parent.name}</p>}</div>
    )},
    { key: 'slug', label: 'Slug', render: v => <code className="text-xs bg-background px-1.5 py-0.5 rounded">{v}</code> },
    { key: 'sort_order', label: 'Order', sortable: true },
    { key: 'is_active', label: 'Status', render: v => <Badge variant={v ? 'success' : 'neutral'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', label: '', className: 'w-20', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => { setEditCat(row); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ]

  return (
    <>
      <SEO title="Categories — Admin" noIndex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-text-primary">Categories</h1><p className="text-sm text-text-secondary mt-0.5">{categories.length} categories</p></div>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => { setEditCat(null); setModalOpen(true) }}>Add category</Button>
        </div>
        <div className="card p-0 overflow-hidden">
          <DataTable columns={columns} data={categories} loading={loading} emptyIcon={Tag} emptyTitle="No categories yet" />
        </div>
      </div>
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit category' : 'New category'} size="md">
        <CategoryForm cat={editCat} categories={categories} onSave={() => { setModalOpen(false); load() }} onCancel={() => setModalOpen(false)} />
      </AdminModal>
    </>
  )
}

export default AdminCategoriesPage
