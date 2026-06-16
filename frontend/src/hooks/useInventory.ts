import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export interface InventoryItem {
  id: string
  powerSph: number
  powerCyl: number
  powerAxis: number
  lensType: string
  lensIndex: string
  coating: string
  quantity: number
  updatedAt: string
}

export interface CreateInventoryPayload {
  powerSph: number
  powerCyl?: number
  powerAxis?: number
  lensType: string
  lensIndex: string
  coating: string
  quantity: number
}

export function useInventory(filters?: { lensType?: string; coating?: string }) {
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.lensType) params.lensType = filters.lensType
      if (filters?.coating) params.coating = filters.coating
      const res = await api.get<InventoryItem[]>('/inventory', { params })
      return res.data
    },
  })
}

export function useCreateInventory() {
  const queryClient = useQueryClient()
  return useMutation<InventoryItem, unknown, CreateInventoryPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<InventoryItem>('/inventory', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useAddStock() {
  const queryClient = useQueryClient()
  return useMutation<InventoryItem, unknown, { id: string; quantity: number }>({
    mutationFn: async ({ id, quantity }) => {
      const res = await api.patch<InventoryItem>(`/inventory/${id}/add-stock`, { quantity })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}
