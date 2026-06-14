import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { OrdersResponse } from '../types/order'

export interface OrderFilters {
  page: number
  limit: number
  status?: string
  lensType?: string
  storeLocation?: string
}

export function useOrders(filters: OrderFilters) {
  return useQuery<OrdersResponse>({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      }
      if (filters.status) params.status = filters.status
      if (filters.lensType) params.lensType = filters.lensType
      if (filters.storeLocation) params.storeLocation = filters.storeLocation

      const res = await api.get<OrdersResponse>('/orders', { params })
      return res.data
    },
  })
}