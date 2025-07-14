import { type BookID, type FulfilledBook } from '../documented_types'

export interface OrderFulfilledEvent {
  type: 'OrderFulfilled'
  timestamp: Date
  data: FulfilledBook
}

export type OrderEvent = OrderFulfilledEvent

export interface BookStockedEvent {
  type: 'BookStocked'
  timestamp: Date
  data: { bookId: BookID, stock: number }
}

export type WarehouseEvent = BookStockedEvent
