import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye, ImageOff, ArrowLeft, Save, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SEO } from '@/components/shared/SEO'
import { DataTable } from '../components/DataTable'
import { AdminModal } from '../components/AdminModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { Pagination } from '@/components/ui/Pagination'
import { adminService } from '@/services/adminService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { productSchema } from '@/utils/validation'
import { slugify } from '@/utils/helpers'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/helpers'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]
const STATUS_COLORS = { active: 'success', draft: 'neutral', archived: 'warning' }

function ProductForm({ product, categories, brands, onSave, onCancel }) {
  const { toastSuccess, toastError } = useUIStore()
  const [error, setError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      sku: product?.sku || '',
      brand_id: product?.brand_id || '',
      category_id: product?.category_id || '',
      price: product?.price || 0,
      compare_price: product?.compare_price || '',
      status: product?.status || 'draft',
      is_featured: product?.is_featured || false,
      tags: product?.tags?.join(', ') || '',
      meta_title: product?.meta_title || '',
      meta_description: product?.meta_description || '',
    },
  })

  const name = watch('name')
  useEffect(() => {
    if (!product && name) setValue('slug', slugify(name))
  }, [name, product, setValue])

  const onSubmit = async (data) => {
    setError('')
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        compare_price: data.compare_price ? Number(data.compare_price) : null,
        brand_id: data.brand_id || null,
        category_id: data.category_id || null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (product) {
        await adminService.updateProduct(product.id, payload)
        toastSuccess('Product updated')
      } else {
        await adminService.createProduct(payload)
        toastSuccess('Product created')
      }
      onSave?.()
    } catch (err) {
      setError(err.message)
      toastError('Failed to save product')
    }
  }

  const handleImageUpload = async (e) => {
    if (!product?.id) return toastError('Save the product first, then upload images')
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const url = await adminService.uploadProductImage(product.id, file)
      await adminService.addProductImage(product.id, url, !product.product_images?.length)
      toastSuccess('Image uploaded')
      onSave?.()
    } catch (err) {
      toastError(err.message || 'Upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product name" required error={errors.name?.message} {...register('name')} />
        <Input label="Slug" required error={errors.slug?.message} hint="URL-friendly identifier" {...register('slug')} />
      </div>

      <Textarea label="Description" rows={3} {...register('description')} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Price (₦)" type="number" min="0" step="0.01" required error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
        <Input label="Compare price (₦)" type="number" min="0" step="0.01" hint="Original price" {...register('compare_price')} />
        <Input label="SKU" placeholder="Optional" {...register('sku')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          placeholder="Select category"
          options={[{ value: '', label: 'No category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          {...register('category_id')}
        />
        <Select
          label="Brand"
          placeholder="Select brand"
          options={[{ value: '', label: 'No brand' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
          {...register('brand_id')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
        <Input label="Tags (comma-separated)" placeholder="e.g. new, sale, featured" {...register('tags')} />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" {...register('is_featured')} />
        <span className="text-sm text-text-secondary font-medium">Mark as featured product</span>
      </label>

      {/* Image upload (only when editing) */}
      {product && (
        <div>
          <p className="form-label mb-2">Product images</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {product.product_images?.map(img => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                <button
                  type="button"
                  onClick={() => adminService.deleteProductImage(img.id).then(onSave)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >×</button>
                {img.is_primary && (
                  <span className="absolute bottom-1 left-1 text-2xs bg-primary text-white px-1 rounded">Primary</span>
                )}
              </div>
            ))}
          </div>
          <label className={cn('inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary cursor-pointer transition-colors', imageUploading && 'opacity-50 pointer-events-none')}>
            <Upload className="w-4 h-4" />
            {imageUploading ? 'Uploading…' : 'Upload image'}
            <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" variant="primary" loading={isSubmitting} leftIcon={Save}>
          {product ? 'Update product' : 'Create product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const { toastSuccess, toastError, openConfirm, closeConfirm } = useUIStore()
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    adminService.getProducts({ page, limit: LIMIT, search, status: statusFilter })
      .then(r => { setProducts(r.products); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {})
    brandService.getAll().then(setBrands).catch(() => {})
  }, [])

  const openEdit = async (row) => {
    const full = await adminService.getProduct(row.id)
    setEditProduct(full)
    setModalOpen(true)
  }

  const handleDelete = (row) => {
    openConfirm({
      title: 'Delete product',
      message: `Are you sure you want to delete "${row.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteProduct(row.id)
          toastSuccess('Product deleted')
          load()
        } catch (err) {
          toastError(err.message)
        } finally {
          closeConfirm()
        }
      },
    })
  }

  const columns = [
    {
      key: 'name', label: 'Product', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-background border border-border overflow-hidden shrink-0">
            {row.product_images?.find(i => i.is_primary)?.url || row.product_images?.[0]?.url
              ? <img src={row.product_images.find(i=>i.is_primary)?.url || row.product_images[0].url} alt={val} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-text-muted" /></div>
            }
          </div>
          <div>
            <p className="font-medium text-text-primary text-sm">{val}</p>
            <p className="text-xs text-text-muted">{row.categories?.name || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price', label: 'Price', sortable: true,
      render: (val) => <span className="font-medium text-text-primary">{formatCurrency(val)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge variant={STATUS_COLORS[val] || 'neutral'} dot>{val}</Badge>,
    },
    {
      key: 'product_variants', label: 'Stock',
      render: (variants) => {
        const total = variants?.reduce((s, v) => s + (v.stock_qty || 0), 0) ?? '—'
        const low = variants?.some(v => v.stock_qty <= 5)
        return <span className={cn('text-sm font-medium', low ? 'text-warning' : 'text-text-secondary')}>{total}</span>
      },
    },
    {
      key: 'created_at', label: 'Created', sortable: true,
      render: (val) => <span className="text-text-muted">{formatDate(val)}</span>,
    },
    {
      key: 'id', label: '', className: 'w-24',
      render: (val, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-primary transition-colors" title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <a href={`/products/${row.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-accent transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-danger transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <SEO title="Products — Admin" noIndex />
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Products</h1>
            <p className="text-sm text-text-secondary mt-0.5">{total} total products</p>
          </div>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => { setEditProduct(null); setModalOpen(true) }}>
            Add product
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search" placeholder="Search products…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input-base pl-9 h-9 text-sm"
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-base h-9 text-sm w-auto pr-8">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="card p-0 overflow-hidden">
          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            emptyTitle="No products found"
            emptyDescription="Create your first product to get started."
          />
        </div>

        {Math.ceil(total / LIMIT) > 1 && (
          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit product' : 'New product'}
        size="xl"
      >
        <ProductForm
          product={editProduct}
          categories={categories}
          brands={brands}
          onSave={() => { setModalOpen(false); load() }}
          onCancel={() => setModalOpen(false)}
        />
      </AdminModal>

      {/* Confirm dialog */}
    </>
  )
}

export default AdminProductsPage
