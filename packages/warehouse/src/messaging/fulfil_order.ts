import { type WarehouseData } from '../data/warehouse_data'
import { type OrderFulfilledEvent } from './events'
import { deductFromShelf } from '../services/deduct_from_shelf'

export async function handleFulfilOrderEvent (data: WarehouseData, event: OrderFulfilledEvent): Promise<void> {
  if (event.type !== 'OrderFulfilled') {
    throw new Error('Expected OrderFulfilled event')
  }

  await deductFromShelf(data, event.data)
}
