import { useState } from 'react'
import { useAddStock } from '../hooks/useInventory'
import type { InventoryItem } from '../hooks/useInventory'

interface InventoryTableProps {
  items: InventoryItem[]
}

function TopUpCell({ item }: { item: InventoryItem }) {
  const [amount, setAmount] = useState('')
  const addStock = useAddStock()

  const qty = Number(amount)
  const canAdd = amount !== '' && qty > 0 && !addStock.isPending

  const handleAdd = () => {
    addStock.mutate(
      { id: item.id, quantity: qty },
      { onSuccess: () => setAmount('') },
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Qty"
        className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
      />
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className="bg-emerald-600 text-white rounded-md px-2 py-1 text-xs font-medium disabled:opacity-40 hover:bg-emerald-700"
      >
        {addStock.isPending ? '...' : '+ Top Up'}
      </button>
    </div>
  )
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Lens Type</th>
            <th className="px-4 py-3">Index</th>
            <th className="px-4 py-3">Coating</th>
            <th className="px-4 py-3">SPH / CYL / Axis</th>
            <th className="px-4 py-3">In Stock</th>
            <th className="px-4 py-3">Add Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{item.lensType.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-gray-600">{item.lensIndex}</td>
              <td className="px-4 py-3 text-gray-600">{item.coating}</td>
              <td className="px-4 py-3 text-gray-600">
                {item.powerSph} / {item.powerCyl} / {item.powerAxis}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                </span>
              </td>
              <td className="px-4 py-3">
                <TopUpCell item={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">No inventory yet — add a stock profile to get started</div>
      )}
    </div>
  )
}
