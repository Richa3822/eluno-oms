import { useState } from 'react'
import { useCreateOrder } from '../hooks/useCreateOrder'
import type { CreateOrderPayload } from '../hooks/useCreateOrder'

interface CreateOrderModalProps {
  onClose: () => void
}

const STORES = ['HSR Layout', 'Mantri Mall']
const LENS_TYPES = ['SINGLE_VISION', 'PROGRESSIVE', 'BIFOCAL']
const LENS_INDICES = ['1.50', '1.56', '1.61', '1.67', '1.74']
const COATINGS = ['AR', 'BLUE_CUT', 'PHOTOCHROMIC', 'NONE']

const inputClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

export function CreateOrderModal({ onClose }: CreateOrderModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [storeLocation, setStoreLocation] = useState(STORES[0])
  const [frameId, setFrameId] = useState('')
  const [lensType, setLensType] = useState(LENS_TYPES[0])
  const [lensIndex, setLensIndex] = useState(LENS_INDICES[0])
  const [coating, setCoating] = useState(COATINGS[0])

  const [rightEye, setRightEye] = useState({ sph: '', cyl: '', axis: '' })
  const [leftEye, setLeftEye] = useState({ sph: '', cyl: '', axis: '' })

  const mutation = useCreateOrder()

  const eyeFilled = (eye: { sph: string; cyl: string; axis: string }) =>
    eye.sph !== '' && eye.cyl !== '' && eye.axis !== ''

  const canSubmit =
    customerName.trim().length > 0 &&
    eyeFilled(rightEye) &&
    eyeFilled(leftEye) &&
    !mutation.isPending

  const handleSubmit = () => {
    const payload: CreateOrderPayload = {
      customerName: customerName.trim(),
      storeLocation,
      prescription: {
        rightEye: {
          sph: Number(rightEye.sph),
          cyl: Number(rightEye.cyl),
          axis: Number(rightEye.axis),
        },
        leftEye: {
          sph: Number(leftEye.sph),
          cyl: Number(leftEye.cyl),
          axis: Number(leftEye.axis),
        },
      },
      lensType,
      lensIndex,
      coating,
    }
    if (frameId.trim()) payload.frameId = frameId.trim()

    mutation.mutate(payload, {
      onSuccess: () => onClose(),
    })
  }

  const renderEyeInputs = (
    eye: { sph: string; cyl: string; axis: string },
    setEye: (v: { sph: string; cyl: string; axis: string }) => void,
  ) => (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className={labelClass}>SPH</label>
        <input
          type="number"
          step="0.25"
          value={eye.sph}
          onChange={(e) => setEye({ ...eye, sph: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>CYL</label>
        <input
          type="number"
          step="0.25"
          value={eye.cyl}
          onChange={(e) => setEye({ ...eye, cyl: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>AXIS</label>
        <input
          type="number"
          value={eye.axis}
          onChange={(e) => setEye({ ...eye, axis: e.target.value })}
          className={inputClass}
        />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-gray-800">Create New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Anjali Rao"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Store Location</label>
              <select
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                className={inputClass}
              >
                {STORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Frame ID (optional)</label>
              <input
                type="text"
                value={frameId}
                onChange={(e) => setFrameId(e.target.value)}
                placeholder="e.g. FRM-1024"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Lens Type</label>
              <select
                value={lensType}
                onChange={(e) => setLensType(e.target.value)}
                className={inputClass}
              >
                {LENS_TYPES.map((l) => (
                  <option key={l} value={l}>{l.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Lens Index</label>
              <select
                value={lensIndex}
                onChange={(e) => setLensIndex(e.target.value)}
                className={inputClass}
              >
                {LENS_INDICES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Coating</label>
              <select
                value={coating}
                onChange={(e) => setCoating(e.target.value)}
                className={inputClass}
              >
                {COATINGS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prescription — Right Eye (OD)</h3>
            {renderEyeInputs(rightEye, setRightEye)}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prescription — Left Eye (OS)</h3>
            {renderEyeInputs(leftEye, setLeftEye)}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium disabled:opacity-40"
          >
            {mutation.isPending ? 'Creating...' : 'Create Order'}
          </button>

          {mutation.isError && (
            <p className="text-red-500 text-xs">Failed to create order. Check the fields and try again.</p>
          )}
        </div>
      </div>
    </div>
  )
}
