import { ObjectId } from 'mongodb'
import { type ShelfId, type BookID, type OrderId } from './src/documented_types'
import { type WarehouseDatabaseAccessor } from './src/warehouse/warehouse_database'

export async function seedWarehouseDatabase (accessor: WarehouseDatabaseAccessor, { books, orders }: { books: Record<BookID, Record<ShelfId, number>>, orders: Record<OrderId, Record<BookID, number>> }): Promise<void> {
  await Promise.all([
    ...Object.keys(books).flatMap(async (book) => {
      const shelves = books[book]

      return Object.keys(shelves).map(async (shelf) => {
        return await accessor.books.insertOne({ book, shelf, count: shelves[shelf] })
      })
    })
  ])
}

export function generateId<T> (): T {
  const id = new ObjectId()
  return (id.toHexString()) as T
}
