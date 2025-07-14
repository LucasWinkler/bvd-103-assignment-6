import { type ShelfId, type BookID } from '../documented_types'
import { getDefaultWarehouseDatabase } from './warehouse_database'

export interface WarehouseData {
  placeBookOnShelf: (bookId: BookID, shelf: ShelfId, count: number) => Promise<void>
  getCopiesOnShelf: (bookId: BookID, shelf: ShelfId) => Promise<number>
  getCopies: (bookId: BookID) => Promise<Record<ShelfId, number>>
  getShelvesWithBook: (bookId: BookID) => Promise<ShelfId[]>
  removeBookFromShelf: (shelf: ShelfId, bookId: BookID, count: number) => Promise<void>
}

export class InMemoryWarehouse implements WarehouseData {
  books: Record<BookID, Record<ShelfId, number>>

  constructor (params?: { books?: Record<BookID, Record<ShelfId, number>> }) {
    const { books } = params ?? {}
    this.books = books ?? {}
  }

  async placeBookOnShelf (bookId: string, shelf: string, count: number): Promise<void> {
    const book = this.books[bookId] ?? {}
    this.books[bookId] = { ...book, [shelf]: count }
  }

  async getCopiesOnShelf (bookId: string, shelf: string): Promise<number> {
    const book = this.books[bookId] ?? {}
    return book[shelf] ?? 0
  }

  async getCopies (bookId: string): Promise<Record<ShelfId, number>> {
    const book = this.books[bookId] ?? {}
    return book
  }

  async getShelvesWithBook (bookId: string): Promise<ShelfId[]> {
    const book = this.books[bookId] ?? {}
    return Object.keys(book)
  }

  async removeBookFromShelf (shelf: ShelfId, bookId: BookID, count: number): Promise<void> {
    const book = this.books[bookId] ?? {}
    if (book[shelf] !== undefined) {
      book[shelf] -= count
      if (book[shelf] <= 0) {
        book[shelf] = 0
      }
      this.books[bookId] = book
    }
  }
}

export async function getDefaultWarehouseData (): Promise<WarehouseData> {
  return await getDefaultWarehouseDatabase()
}
