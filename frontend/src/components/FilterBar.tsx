interface FilterBarProps {
    status: string
    lensType: string
    storeLocation: string
    onStatusChange: (value: string) => void
    onLensTypeChange: (value: string) => void
    onStoreLocationChange: (value: string) => void
  }
  
  const STATUSES = ['ORDER_PLACED', 'LENS_CUTTING', 'QC_CHECK', 'QC_PASSED', 'QC_FAILED', 'DISPATCH', 'DELIVERED']
  const LENS_TYPES = ['SINGLE_VISION', 'PROGRESSIVE', 'BIFOCAL']
  const STORES = ['HSR Layout', 'Mantri Mall']
  
  export function FilterBar({
    status,
    lensType,
    storeLocation,
    onStatusChange,
    onLensTypeChange,
    onStoreLocationChange,
  }: FilterBarProps) {
    return (
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
  
        <select
          value={lensType}
          onChange={(e) => onLensTypeChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">All Lens Types</option>
          {LENS_TYPES.map((l) => (
            <option key={l} value={l}>{l.replace('_', ' ')}</option>
          ))}
        </select>
  
        <select
          value={storeLocation}
          onChange={(e) => onStoreLocationChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">All Stores</option>
          {STORES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    )
  }