import React, { useState } from 'react'
import useDialogState from '@/hooks/dashboardRelated/use-dialog-state'
import { type OrderOutput } from '@/redux/apiSlices/Order/orderSlice'

type OrdersDialogType = 'view' | 'delete'

type OrdersContextType = {
  open: OrdersDialogType | null
  setOpen: (str: OrdersDialogType | null) => void
  currentRow: OrderOutput | null
  setCurrentRow: React.Dispatch<React.SetStateAction<OrderOutput | null>>
}

const OrdersContext = React.createContext<OrdersContextType | null>(null)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<OrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<OrderOutput | null>(null)

  return (
    <OrdersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </OrdersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const ordersContext = React.useContext(OrdersContext)

  if (!ordersContext) {
    throw new Error('useOrders has to be used within <OrdersContext>')
  }

  return ordersContext
}
