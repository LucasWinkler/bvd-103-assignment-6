import { type BookID, type OrderId } from '../documented_types'
import { InMemoryOrders, type OrdersData } from '../data/orders_data'

export async function placeOrder (data: OrdersData, books: BookID[]): Promise<OrderId> {
  const order: Record<BookID, number> = {}

  for (const book of books) {
    order[book] = 1 + (order[book] ?? 0)
  }

  return await data.placeOrder(order)
}

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest

  test('can place an order for a single book', async () => {
    const data = new InMemoryOrders()

    const orderId = await placeOrder(data, ['my_book'])

    const order = await data.getOrder(orderId)

    expect(order).toBeTruthy()

    if (order !== false) {
      expect(order).toHaveProperty('my_book')
      expect(order.my_book).toBe(1)
    }
  })

  test('can place an order for multiple books', async () => {
    const data = new InMemoryOrders()

    const orderId = await placeOrder(data, ['my_book', 'my_second_book'])

    const order = await data.getOrder(orderId)

    expect(order).toBeTruthy()

    if (order !== false) {
      expect(order).toHaveProperty('my_book')
      expect(order.my_book).toBe(1)
      expect(order).toHaveProperty('my_second_book')
      expect(order.my_second_book).toBe(1)
    }
  })

  test('can place an order for multiple copies of a book', async () => {
    const data = new InMemoryOrders()

    const orderId = await placeOrder(data, ['my_book', 'my_book', 'my_book'])

    const order = await data.getOrder(orderId)

    expect(order).toBeTruthy()

    if (order !== false) {
      expect(order).toHaveProperty('my_book')
      expect(order.my_book).toBe(3)
    }
  })
}
