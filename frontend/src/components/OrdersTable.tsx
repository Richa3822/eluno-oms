import type { Order } from '../types/order'
import { getStatusColor, getSlaColor, formatHoursRemaining } from '../utils/statusColors'

interface OrdersTableProps {
  orders: Order[]
  onRowClick: (order: Order) => void
}

export function OrdersTable({ orders, onRowClick }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Store</th>
            <th className="px-4 py-3">Lens Type</th>
            <th className="px-4 py-3">Coating</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">SLA</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onRowClick(order)}
              className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-800">{order.customerName}</td>
              <td className="px-4 py-3 text-gray-600">{order.storeLocation}</td>
              <td className="px-4 py-3 text-gray-600">{order.lensType.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-gray-600">{order.coating}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </td>
              <td className={`px-4 py-3 ${getSlaColor(order.isBreached, order.isAtRisk)}`}>
                {formatHoursRemaining(order.hoursRemaining)}
                {order.isBreached && ' 🔴'}
                {order.isAtRisk && !order.isBreached && ' 🟠'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-400">No orders found</div>
      )}
    </div>
  )
}