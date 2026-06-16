import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export interface EyePrescription {
  sph: number
  cyl: number
  axis: number
}

export interface CreateOrderPayload {
  customerName: string
  storeLocation: string
  prescription: {
    rightEye: EyePrescription
    leftEye: EyePrescription
  }
  frameId?: string
  lensType: string
  lensIndex: string
  coating: string
}

export interface CreateOrderResponse {
  id: string
  status: string
  inStock: boolean
  message: string
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation<CreateOrderResponse, unknown, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<CreateOrderResponse>('/orders', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
