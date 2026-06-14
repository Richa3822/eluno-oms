export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ORDER_PLACED: 'bg-gray-100 text-gray-700',
      LENS_CUTTING: 'bg-blue-100 text-blue-700',
      QC_CHECK: 'bg-yellow-100 text-yellow-700',
      QC_PASSED: 'bg-green-100 text-green-700',
      QC_FAILED: 'bg-red-100 text-red-700',
      DISPATCH: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }
  
  export function getSlaColor(isBreached: boolean, isAtRisk: boolean): string {
    if (isBreached) return 'text-red-600 font-semibold'
    if (isAtRisk) return 'text-orange-500 font-semibold'
    return 'text-gray-700'
  }
  
  export function formatHoursRemaining(hours: number): string {
    if (hours < 0) return `${Math.abs(hours)}h overdue`
    return `${hours}h left`
  }