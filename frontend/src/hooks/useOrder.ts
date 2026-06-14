import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Order } from '../types/order'

export function useOrder(id: string | null) {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get<Order>(`/orders/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}