import { useState } from 'react'
import { useOrders } from './hooks/useOrders'
import { useOrder } from './hooks/useOrder'
import { useInventory } from './hooks/useInventory'
import { OrdersTable } from './components/OrdersTable'
import { InventoryTable } from './components/InventoryTable'
import { FilterBar } from './components/FilterBar'
import { OrderDetailModal } from './components/OrderDetailModal'
import { CreateOrderModal } from './components/CreateOrderModal'
import { AddInventoryModal } from './components/AddInventoryModal'
import type { Order } from './types/order'

type View = 'orders' | 'inventory'

function App() {
  const [view, setView] = useState<View>('orders')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [lensType, setLensType] = useState('')
  const [storeLocation, setStoreLocation] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false)

  const { data, isLoading, isError } = useOrders({
    page,
    limit: 10,
    status: status || undefined,
    lensType: lensType || undefined,
    storeLocation: storeLocation || undefined,
  })

  const {
    data: inventory,
    isLoading: invLoading,
    isError: invError,
  } = useInventory()

  const { data: selectedOrder } = useOrder(selectedOrderId)

  const handleRowClick = (order: Order) => {
    setSelectedOrderId(order.id)
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Eluno OMS Dashboard</h1>
        {view === 'orders' ? (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            + Add Order
          </button>
        ) : (
          <button
            onClick={() => setIsAddInventoryOpen(true)}
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            + Add Stock Profile
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3">
        <button onClick={() => setView('orders')} className={tabClass(view === 'orders')}>
          Orders
        </button>
        <button onClick={() => setView('inventory')} className={tabClass(view === 'inventory')}>
          Inventory
        </button>
      </div>

      {view === 'orders' && (
        <>
          <FilterBar
            status={status}
            lensType={lensType}
            storeLocation={storeLocation}
            onStatusChange={(v) => { setStatus(v); setPage(1) }}
            onLensTypeChange={(v) => { setLensType(v); setPage(1) }}
            onStoreLocationChange={(v) => { setStoreLocation(v); setPage(1) }}
          />

          {isLoading && <div className="text-gray-500">Loading orders...</div>}
          {isError && <div className="text-red-500">Failed to load orders. Is the backend running?</div>}

          {data && (
            <>
              <OrdersTable orders={data.data} onRowClick={handleRowClick} />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  Page {data.meta.page} of {data.meta.totalPages} — {data.meta.total} total orders
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-40 bg-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                    disabled={page >= data.meta.totalPages}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-40 bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {view === 'inventory' && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Lens stock on hand. When new stock arrives, use <strong>Top Up</strong> to increment instantly —
            the next matching order is auto fast-tracked to LENS CUTTING.
          </p>

          {invLoading && <div className="text-gray-500">Loading inventory...</div>}
          {invError && <div className="text-red-500">Failed to load inventory. Is the backend running?</div>}

          {inventory && <InventoryTable items={inventory} />}
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrderId(null)} />
      )}

      {isCreateOpen && (
        <CreateOrderModal onClose={() => setIsCreateOpen(false)} />
      )}

      {isAddInventoryOpen && (
        <AddInventoryModal onClose={() => setIsAddInventoryOpen(false)} />
      )}
    </div>
  )
}

export default App
