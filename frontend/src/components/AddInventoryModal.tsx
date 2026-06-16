import { useState } from 'react'
import { useCreateInventory } from '../hooks/useInventory'
import type { CreateInventoryPayload } from '../hooks/useInventory'

interface AddInventoryModalProps {
  onClose: () => void
}

const LENS_TYPES = ['SINGLE_VISION', 'PROGRESSIVE', 'BIFOCAL']
const LENS_INDICES = ['1.50', '1.56', '1.61', '1.67', '1.74']
const COATINGS = ['AR', 'BLUE_CUT', 'PHOTOCHROMIC', 'NONE']

const inputClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

export function AddInventoryModal({ onClose }: AddInventoryModalProps) {
  const [lensType, setLensType] = useState(LENS_TYPES[0])
  const [lensIndex, setLensIndex] = useState(LENS_INDICES[0])
  const [coating, setCoating] = useState(COATINGS[0])
  const [powerSph, setPowerSph] = useState('')
  const [powerCyl, setPowerCyl] = useState('')
  const [powerAxis, setPowerAxis] = useState('')
  const [quantity, setQuantity] = useState('')

  const mutation = useCreateInventory()

  const canSubmit = powerSph !== '' && quantity !== '' && Number(quantity) >= 0 && !mutation.isPending

  const handleSubmit = () => {
    const payload: CreateInventoryPayload = {
      powerSph: Number(powerSph),
      lensType,
      lensIndex,
      coating,
      quantity: Number(quantity),
    }
    if (powerCyl !== '') payload.powerCyl = Number(powerCyl)
    if (powerAxis !== '') payload.powerAxis = Number(powerAxis)

    mutation.mutate(payload, { onSuccess: () => onClose() })
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-gray-800">Add Stock Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Lens Type</label>
              <select value={lensType} onChange={(e) => setLensType(e.target.value)} className={inputClass}>
                {LENS_TYPES.map((l) => (
                  <option key={l} value={l}>{l.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Lens Index</label>
              <select value={lensIndex} onChange={(e) => setLensIndex(e.target.value)} className={inputClass}>
                {LENS_INDICES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Coating</label>
              <select value={coating} onChange={(e) => setCoating(e.target.value)} className={inputClass}>
                {COATINGS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>SPH</label>
              <input type="number" step="0.25" value={powerSph} onChange={(e) => setPowerSph(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CYL (optional)</label>
              <input type="number" step="0.25" value={powerCyl} onChange={(e) => setPowerCyl(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Axis (optional)</label>
              <input type="number" value={powerAxis} onChange={(e) => setPowerAxis(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Quantity in Stock</label>
            <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 10" className={inputClass} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium disabled:opacity-40"
          >
            {mutation.isPending ? 'Adding...' : 'Add Stock Profile'}
          </button>

          {mutation.isError && (
            <p className="text-red-500 text-xs">Failed to add stock profile. Check the fields and try again.</p>
          )}
        </div>
      </div>
    </div>
  )
}
