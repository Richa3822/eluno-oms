import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Order } from '../types/order'
import { getStatusColor, formatHoursRemaining, getSlaColor } from '../utils/statusColors'

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
}

const STATUS_OPTIONS = [
  'ORDER_PLACED',
  'LENS_CUTTING',
  'QC_CHECK',
  'QC_PASSED',
  'QC_FAILED',
  'DISPATCH',
  'DELIVERED',
]

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [newStatus, setNewStatus] = useState(order.status)
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/orders/${order.id}/status`, {
        status: newStatus,
        reason,
        updatedBy: 'ops_team',
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onClose()
    },
  })

  const canSubmit = newStatus !== order.status && reason.trim().length > 0

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{order.customerName}</h2>
            <p className="text-sm text-gray-500">{order.storeLocation}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="text-gray-500">Lens Type:</span>{' '}
            <span className="font-medium">{order.lensType.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">Coating:</span>{' '}
            <span className="font-medium">{order.coating}</span>
          </div>
          <div>
            <span className="text-gray-500">Current Status:</span>{' '}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">SLA:</span>{' '}
            <span className={getSlaColor(order.isBreached, order.isAtRisk)}>
              {formatHoursRemaining(order.hoursRemaining)}
            </span>
          </div>
        </div>

        {/* Status update form */}
        <div className="border-t pt-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Update Status</h3>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for status change (required)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
            rows={2}
          />
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="w-full bg-gray-800 text-white rounded-md py-2 text-sm font-medium disabled:opacity-40"
          >
            {mutation.isPending ? 'Updating...' : 'Update Status'}
          </button>
          {mutation.isError && (
            <p className="text-red-500 text-xs mt-1">Failed to update. Try again.</p>
          )}
        </div>

        {/* Status history */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Status History</h3>
          <div className="space-y-2">
            {order.statusLogs?.slice().reverse().map((log) => (
              <div key={log.id} className="text-xs border-l-2 border-gray-200 pl-3 py-1">
                <div className="font-medium text-gray-700">
                  {log.fromStatus ? `${log.fromStatus.replace('_', ' ')} → ` : ''}
                  {log.toStatus.replace('_', ' ')}
                </div>
                {log.reason && <div className="text-gray-500">{log.reason}</div>}
                <div className="text-gray-400">
                  {new Date(log.createdAt).toLocaleString()} by {log.updatedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}