import { type WarehouseData } from '../data/warehouse_data'

export async function removeBookFromShelves (data: WarehouseData, bookId: string): Promise<void> {
  const shelves = await data.getShelvesWithBook(bookId)

  if (shelves.length === 0) {
    return
  }

  for (const shelf of shelves) {
    const numberOfCopies = await data.getCopiesOnShelf(bookId, shelf)
    if (numberOfCopies > 0) {
      await data.removeBookFromShelf(shelf, bookId, numberOfCopies)
    }
  }
}
