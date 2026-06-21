import { useUIStore } from '@/store/uiStore'
import { AdminModal } from '@/features/admin/components/AdminModal'
import { Button } from '@/components/ui/Button'

/**
 * Global confirm dialog — mounted once in AdminLayout.
 * Triggered via useUIStore().openConfirm({ title, message, confirmLabel, variant, onConfirm })
 */
export function ConfirmDialog() {
  const { confirmModal, closeConfirm } = useUIStore()

  if (!confirmModal) return null

  return (
    <AdminModal
      open={!!confirmModal}
      onClose={closeConfirm}
      title={confirmModal.title || 'Are you sure?'}
      size="sm"
    >
      <p className="text-sm text-text-secondary mb-5">{confirmModal.message}</p>
      <div className="flex gap-3">
        <Button
          variant={confirmModal.variant || 'danger'}
          size="sm"
          onClick={confirmModal.onConfirm}
        >
          {confirmModal.confirmLabel || 'Confirm'}
        </Button>
        <Button variant="outline" size="sm" onClick={closeConfirm}>
          Cancel
        </Button>
      </div>
    </AdminModal>
  )
}

export default ConfirmDialog
