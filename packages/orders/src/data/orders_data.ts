import { ObjectId } from 'mongodb'
import { type BookID, type OrderId, type ShelfId } from '../documented_types'
import { getDefaultOrdersDatabase } from './orders_database'

export interface OrdersData {
  getOrder: (order: OrderId) => Promise<Record<BookID, number> | false>
  placeOrder: (books: Record<BookID, number>) => Promise<OrderId>
  listOrders: () => Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>>
  removeOrder: (order: OrderId) => Promise<void>
}

export class InMemoryOrders implements OrdersData {
  orders: Record<OrderId, Record<BookID, number>>

  constructor (params?: { orders?: Record<OrderId, Record<ShelfId, number>> }) {
    const { orders } = params ?? {}
    this.orders = orders ?? {}
  }

  async getOrder (order: OrderId): Promise<Record<BookID, number> | false> {
    return order in this.orders ? this.orders[order] : false
  }

  async removeOrder (order: OrderId): Promise<void> {
    const orders: Record<string, Record<BookID, number>> = {}

    for (const orderId of Object.keys(this.orders)) {
      if (orderId !== order) {
        orders[orderId] = this.orders[orderId]
      }
    }

    this.orders = orders
  }

  async listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
    return Object.keys(this.orders).map((orderId) => {
      const books = this.orders[orderId]
      return { orderId, books }
    })
  }

  async placeOrder (books: Record<string, number>): Promise<OrderId> {
    const order = new ObjectId().toHexString()
    this.orders[order] = books
    return order
  }
}

export async function getDefaultOrdersData (): Promise<OrdersData> {
  return await getDefaultOrdersDatabase()
}
