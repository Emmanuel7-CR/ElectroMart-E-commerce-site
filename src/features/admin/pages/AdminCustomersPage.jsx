import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Eye, UserCheck, UserX } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { DataTable } from '../components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/utils/date'
import { useUIStore } from '@/store/uiStore'

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toastSuccess, toastError } = useUIStore()
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    adminService.getCustomers({ page, limit: LIMIT, search })
      .then(r => { setCustomers(r.customers); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (customer) => {
    try {
      await adminService.updateCustomerStatus(customer.id, !customer.is_active)
      toastSuccess(`Customer ${customer.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch (err) { toastError(err.message) }
  }

  const columns = [
    { key: 'full_name', label: 'Name', sortable: true, render: (v, row) => (
      <div>
        <p className="font-medium text-text-primary">{v || '—'}</p>
        <p className="text-xs text-text-muted">{row.email}</p>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: v => v || '—' },
    { key: 'role', label: 'Role', render: v => (
      <Badge variant={v === 'admin' || v === 'super_admin' ? 'info' : 'neutral'} dot>{v}</Badge>
    )},
    { key: 'is_active', label: 'Status', render: v => (
      <Badge variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'created_at', label: 'Joined', sortable: true, render: v => <span className="text-text-muted">{formatDate(v)}</span> },
    { key: 'id', label: '', className: 'w-20', render: (v, row) => (
      <div className="flex items-center gap-1">
        <Link to={`/admin/customers/${v}`} className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-primary transition-colors" title="View">
          <Eye className="w-3.5 h-3.5" />
        </Link>
        <button onClick={() => toggleStatus(row)} className="p-1.5 rounded-lg hover:bg-border text-text-muted hover:text-text-primary transition-colors"
          title={row.is_active ? 'Deactivate' : 'Activate'}>
          {row.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
        </button>
      </div>
    )},
  ]

  return (
    <>
      <SEO title="Customers — Admin" noIndex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-text-primary">Customers</h1><p className="text-sm text-text-secondary mt-0.5">{total} accounts</p></div>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="search" placeholder="Search by name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-base pl-9 h-9 text-sm" />
        </div>
        <div className="card p-0 overflow-hidden">
          <DataTable columns={columns} data={customers} loading={loading} emptyIcon={Users} emptyTitle="No customers yet" />
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

export default AdminCustomersPage
