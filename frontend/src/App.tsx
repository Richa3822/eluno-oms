import { useState } from 'react'
import { useOrders } from './hooks/useOrders'
import { OrdersTable } from './components/OrdersTable'
import { FilterBar } from './components/FilterBar'
import type { Order } from './types/order'

function App() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [lensType, setLensType] = useState('')
  const [storeLocation, setStoreLocation] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading, isError } = useOrders({
    page,
    limit: 10,
    status: status || undefined,
    lensType: lensType || undefined,
    storeLocation: storeLocation || undefined,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Eluno OMS Dashboard</h1>

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
          <OrdersTable orders={data.data} onRowClick={setSelectedOrder} />

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

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-2">{selectedOrder.customerName}</h2>
            <p className="text-sm text-gray-500">Status: {selectedOrder.status}</p>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App