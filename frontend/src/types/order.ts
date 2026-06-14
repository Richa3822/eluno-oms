export interface OrderStatusLog {
    id: string
    fromStatus: string | null
    toStatus: string
    reason: string | null
    updatedBy: string
    createdAt: string
  }
  
  export interface Order {
    id: string
    customerName: string
    storeLocation: string
    lensType: string
    lensIndex: string
    coating: string
    status: string
    slaDeadline: string
    createdAt: string
    hoursRemaining: number
    isBreached: boolean
    isAtRisk: boolean
    statusLogs?: OrderStatusLog[]
  }
  
  export interface OrdersResponse {
    data: Order[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }