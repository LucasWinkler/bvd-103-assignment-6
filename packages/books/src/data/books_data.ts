import { type BookID } from '../documented_types'

export interface BooksStockData {
  updateStock: (bookId: BookID, stock: number) => Promise<void>
  getStock: (bookId: BookID) => Promise<number | undefined>
  getAllStock: () => Promise<Record<BookID, number>>
}

export class InMemoryStockCache implements BooksStockData {
  private stock: Record<BookID, number> = {}

  async updateStock (bookId: BookID, stock: number): Promise<void> {
    this.stock[bookId] = stock
  }

  async getStock (bookId: BookID): Promise<number | undefined> {
    return this.stock[bookId]
  }

  async getAllStock (): Promise<Record<BookID, number>> {
    return { ...this.stock }
  }
}
