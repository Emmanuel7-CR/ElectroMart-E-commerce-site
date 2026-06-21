import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, Trash2, Star } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { DataTable } from '../components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/utils/date'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/helpers'

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all']

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')
  const { toastSuccess, toastError } = useUIStore()
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    adminService.getReviews({ page, limit: LIMIT, status })
      .then(r => { setReviews(r.reviews); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, newStatus) => {
    try { await adminService.updateReviewStatus(id, newStatus); toastSuccess(`Review ${newStatus}`); load() }
    catch (err) { toastError(err.message) }
  }

  const deleteReview = async (id) => {
    try { await adminService.deleteReview(id); toastSuccess('Review deleted'); load() }
    catch (err) { toastError(err.message) }
  }

  const columns = [
    { key: 'products', label: 'Product', render: v => <span className="font-medium text-text-primary text-sm">{v?.name || '—'}</span> },
    { key: 'profiles', label: 'Customer', render: v => <span className="text-text-secondary">{v?.full_name || v?.email || '—'}</span> },
    { key: 'rating', label: 'Rating', render: v => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn('w-3.5 h-3.5', i < v ? 'fill-warning text-warning' : 'text-border')} />
        ))}
      </div>
    )},
    { key: 'body', label: 'Review', render: v => <p className="text-sm text-text-secondary max-w-xs truncate">{v}</p> },
    { key: 'status', label: 'Status', render: v => (
      <Badge variant={v === 'approved' ? 'success' : v === 'rejected' ? 'danger' : 'warning'}>{v}</Badge>
    )},
    { key: 'created_at', label: 'Date', render: v => <span className="text-text-muted">{formatDate(v)}</span> },
    { key: 'id', label: '', className: 'w-28', render: (v, row) => (
      <div className="flex items-center gap-1">
        {row.status !== 'approved' && (
          <button onClick={() => updateStatus(v, 'approved')} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-text-muted hover:text-success transition-colors" title="Approve">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        {row.status !== 'rejected' && (
          <button onClick={() => updateStatus(v, 'rejected')} className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-text-muted hover:text-warning transition-colors" title="Reject">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => deleteReview(v)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-danger transition-colors" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    )},
  ]

  return (
    <>
      <SEO title="Reviews — Admin" noIndex />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Reviews</h1>
          <p className="text-sm text-text-secondary mt-0.5">{total} reviews</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                status === s ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:text-text-primary')}>
              {s === 'all' ? 'All reviews' : s}
            </button>
          ))}
        </div>
        <div className="card p-0 overflow-hidden">
          <DataTable columns={columns} data={reviews} loading={loading} emptyIcon={Star} emptyTitle="No reviews found" />
        </div>
        {Math.ceil(total / LIMIT) > 1 && (
          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} />
          </div>
        )}
      </div>
    </>
  )
}

export default AdminReviewsPage
