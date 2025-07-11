import { type FulfilledBook } from '../documented_types'

export interface OrderFulfilledEvent {
  type: 'OrderFulfilled'
  timestamp: Date
  data: FulfilledBook
}

export type OrderEvent = OrderFulfilledEvent
