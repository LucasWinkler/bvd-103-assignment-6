import { type WarehouseData } from '../data/warehouse_data'
import { type FulfilledBook } from '../documented_types'

export async function deductFromShelf (data: WarehouseData, fulfilledBooks: FulfilledBook): Promise<void> {
  const { book, shelf, numberOfBooks } = fulfilledBooks

  const numberOfCopies = await data.getCopiesOnShelf(shelf, book)
  const remainingCopies = numberOfCopies - numberOfBooks

  if (remainingCopies < 0) {
    throw new Error(`Not enough copies of ${book} on shelf ${shelf}`)
  }

  await data.placeBookOnShelf(shelf, book, numberOfBooks)
}
