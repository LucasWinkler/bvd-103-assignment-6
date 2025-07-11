import { ObjectId, type Collection, type Db } from 'mongodb'
import { type BookID, type OrderId } from '../documented_types'
import { client } from '../database_access'
import { type OrdersData, InMemoryOrders } from './orders_data'

export interface OrdersDatabaseAccessor {
  database: Db
  orders: Collection<{ books: Record<BookID, number> }>
}
export interface AppWarehouseDatabaseState {
  orders: OrdersData
}

export async function getOrdersDatabase (dbName?: string): Promise<OrdersDatabaseAccessor> {
  const database = client.db(dbName ?? Math.floor(Math.random() * 100000).toPrecision())
  const orders = database.collection<{ books: Record<BookID, number> }>('orders')

  return {
    database,
    orders
  }
}

export class DatabaseOrders implements OrdersData {
  accessor: OrdersDatabaseAccessor

  constructor (accessor: OrdersDatabaseAccessor) {
    this.accessor = accessor
  }

  async getOrder (order: OrderId): Promise<Record<BookID, number> | false> {
    const result = await this.accessor.orders.findOne({ _id: ObjectId.createFromHexString(order) })
    return result !== null ? result.books : false
  }

  async removeOrder (order: OrderId): Promise<void> {
    await this.accessor.orders.deleteOne({ _id: ObjectId.createFromHexString(order) })
  }

  async listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
    const result = await this.accessor.orders.find().toArray()

    return result.map(({ _id, books }) => {
      return { orderId: _id.toHexString(), books }
    })
  }

  async placeOrder (books: Record<string, number>): Promise<OrderId> {
    const result = await this.accessor.orders.insertOne({ books })
    return result.insertedId.toHexString()
  }
}

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest

  test('order crud works as expected', async () => {
    const db = await getOrdersDatabase()
    const memData = new InMemoryOrders()
    const dbData = new DatabaseOrders(db)

    const [memOrderId, dbOrderId] = await Promise.all([memData.placeOrder({ book: 2 }), dbData.placeOrder({ book: 2 })])
    const [memOrder, dbOrder] = await Promise.all([memData.getOrder(memOrderId), dbData.getOrder(dbOrderId)])

    expect(memOrder).toMatchObject(dbOrder)
    expect(dbOrder).toBeTruthy()
    if (dbOrder !== false) {
      expect(dbOrder.book).toEqual(2)
    }

    const [memOrderId2, dbOrderId2] = await Promise.all([memData.placeOrder({ book: 1 }), dbData.placeOrder({ book: 1 })])
    const [memList, dbList] = await Promise.all([memData.listOrders(), dbData.listOrders()])

    expect(memList.length).toEqual(dbList.length)
    expect(dbList.length).toEqual(2)

    await Promise.all([memData.removeOrder(memOrderId), dbData.removeOrder(dbOrderId)])
    await Promise.all([memData.removeOrder(memOrderId2), dbData.removeOrder(dbOrderId2)])

    const [memList2, dbList2] = await Promise.all([memData.listOrders(), dbData.listOrders()])

    expect(memList2.length).toEqual(dbList2.length)
    expect(dbList2.length).toEqual(0)
  })
}

export async function getDefaultOrdersDatabase (name?: string): Promise<OrdersData> {
  const db = await getOrdersDatabase(name)
  return new DatabaseOrders(db)
}
