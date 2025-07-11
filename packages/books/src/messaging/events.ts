import { type Book, type BookID } from '../documented_types'

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
