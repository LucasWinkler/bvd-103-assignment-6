import { ObjectId } from 'mongodb'
import {
  type BookID,
  type OrderId
} from './src/documented_types'
import { type OrdersDatabaseAccessor } from './src/order/orders_database'

export async function seedOrdersDatabase (
  accessor: OrdersDatabaseAccessor,
  {
    orders
  }: {
    orders: Record<OrderId, Record<BookID, number>>
  }
): Promise<void> {
  await Promise.all([
    ...Object.keys(orders).map(async order => {
      const _id = ObjectId.createFromHexString(order)
      return await accessor.orders.insertOne({ _id, books: orders[order] })
    })
  ])
}

export function generateId<T> (): T {
  const id = new ObjectId()
  return id.toHexString() as T
}
