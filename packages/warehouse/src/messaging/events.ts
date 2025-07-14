import { type Book, type BookID, type FulfilledBook } from '../documented_types'

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

export interface BookAddedEvent {
  type: 'BookAdded'
  timestamp: Date
  data: Book
}

export interface BookUpdatedEvent {
  type: 'BookUpdated'
  timestamp: Date
  data: Book
}

export interface BookDeletedEvent {
  type: 'BookDeleted'
  timestamp: Date
  data: BookID
}

export type BookEvent =
  | BookAddedEvent
  | BookUpdatedEvent
  | BookDeletedEvent
