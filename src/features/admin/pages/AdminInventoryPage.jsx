import { useState, useEffect, useCallback } from 'react'
import { Search, BarChart2, Plus, Minus } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { DataTable } from '../components/DataTable'
import { AdminModal } from '../components/AdminModal'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Alert } from '@/components/ui/Alert'
import { adminService } from '@/services/adminService'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/helpers'

export function AdminInventoryPage() {
  const [variants, setVariants] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adjustModal, setAdjustModal] = useState(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState('')
  const { toastSuccess, toastError } = useUIStore()
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    adminService.getInventory({ page, limit: LIMIT, search })
      .then(r => { setVariants(r.variants); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleAdjust = async () => {
    if (!adjustQty) return setAdjustError('Enter a quantity (positive to add, negative to subtract)')
    setAdjusting(true); setAdjustError('')
    try {
      await adminService.adjustStock(adjustModal.id, Number(adjustQty), adjustNote || 'Manual adjustment')
      toastSuccess('Stock updated')
      setAdjustModal(null); setAdjustQty(0); setAdjustNote('')
      load()
    } catch (err) { setAdjustError(err.message); toastError('Failed') }
    finally { setAdjusting(false) }
  }

  const columns = [
    { key: 'products', label: 'Product', render: (v, row) => (
      <div>
        <p className="font-medium text-text-primary">{v?.name || '—'}</p>
        <p className="text-xs text-text-muted">{row.name}</p>
      </div>
    )},
    { key: 'sku', label: 'SKU', render: v => v ? <code className="text-xs bg-background px-1.5 py-0.5 rounded">{v}</code> : '—' },
    { key: 'stock_qty', label: 'Stock', sortable: true, render: (v, row) => (
      <span className={cn('font-bold', v === 0 ? 'text-danger' : v <= row.low_stock_threshold ? 'text-warning' : 'text-success')}>
        {v}
      </span>
    )},
    { key: 'low_stock_threshold', label: 'Threshold', render: v => <span className="text-text-muted">{v}</span> },
    { key: 'is_active', label: 'Active', render: v => <span className={cn('text-xs font-medium', v ? 'text-success' : 'text-text-muted')}>{v ? 'Yes' : 'No'}</span> },
    { key: 'id', label: '', className: 'w-24', render: (v, row) => (
      <Button variant="outline" size="sm" onClick={() => { setAdjustModal(row); setAdjustQty(0); setAdjustNote('') }}>
        Adjust
      </Button>
    )},
  ]

  return (
    <>
      <SEO title="Inventory — Admin" noIndex />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Inventory</h1>
          <p className="text-sm text-text-secondary mt-0.5">{total} variants tracked</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="search" placeholder="Search variants…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-base pl-9 h-9 text-sm" />
        </div>
        <div className="card p-0 overflow-hidden">
          <DataTable columns={columns} data={variants} loading={loading} emptyIcon={BarChart2} emptyTitle="No inventory data" />
        </div>
        {Math.ceil(total / LIMIT) > 1 && (
          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AdminModal open={!!adjustModal} onClose={() => setAdjustModal(null)} title="Adjust stock" size="sm">
        {adjustModal && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text-primary">{adjustModal.products?.name}</p>
              <p className="text-xs text-text-muted">{adjustModal.name} · Current stock: <strong>{adjustModal.stock_qty}</strong></p>
            </div>
            {adjustError && <Alert variant="error">{adjustError}</Alert>}
            <div>
              <label className="form-label">Quantity change</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setAdjustQty(q => Number(q) - 1)} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-background transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} className="input-base text-center w-24 font-bold" />
                <button onClick={() => setAdjustQty(q => Number(q) + 1)} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-background transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-xs text-text-muted mt-1">Positive = add stock · Negative = remove stock</p>
            </div>
            <div>
              <label className="form-label">Note (optional)</label>
              <input type="text" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="e.g. Received new shipment" className="input-base" />
            </div>
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button variant="primary" size="sm" onClick={handleAdjust} loading={adjusting}>Save adjustment</Button>
              <Button variant="outline" size="sm" onClick={() => setAdjustModal(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </AdminModal>
    </>
  )
}

export default AdminInventoryPage
