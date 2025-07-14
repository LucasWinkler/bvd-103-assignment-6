import { type WarehouseData } from '../data/warehouse_data'
import { type BookDeletedEvent, type OrderFulfilledEvent } from './events'
import { deductFromShelf } from '../services/deduct_from_shelf'
import { removeBookFromShelves } from '../services/remove_from_shelves'

export async function handleFulfilOrderEvent (data: WarehouseData, event: OrderFulfilledEvent): Promise<void> {
  if (event.type !== 'OrderFulfilled') {
    throw new Error('Expected OrderFulfilled event')
  }

  await deductFromShelf(data, event.data)
}

export async function handleBookDeletedEvent (data: WarehouseData, event: BookDeletedEvent): Promise<void> {
  if (event.type !== 'BookDeleted') {
    throw new Error('Expected BookDeleted event')
  }

  await removeBookFromShelves(data, event.data)
}
