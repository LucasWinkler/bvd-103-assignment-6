import previous_assignment from './assignment-3'

export type BookID = string

export interface Book {
  id?: BookID
  name: string
  author: string
  description: string
  price: number
  image: string
};

export interface Filter {
  from?: number
  to?: number
  name?: string
  author?: string
};

export const baseUrl = '/api'

// If multiple filters are provided, any book that matches at least one of them should be returned
// Within a single filter, a book would need to match all the given conditions
async function listBooks (filters?: Filter[]): Promise<Book[]> {
  // We then make the request
  const cleanedFilters = (filters ?? []).filter(f => !isEmptyFilter(f))
  const isFiltered = cleanedFilters.length !== 0
  const result = await fetch(`${baseUrl}/books/list`, {
    body: JSON.stringify(cleanedFilters),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isFiltered ? { 'X-Has-Filters': '1' } : {})
    }
  })

  if (result.ok) {
    // And if it is valid, we parse the JSON result and return it.
    return await result.json() as Book[]
  } else {
    throw new Error('Failed to fetch books')
  }
}

async function createOrUpdateBook (book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book)
}

async function removeBook (book: BookID): Promise<void> {
  await previous_assignment.removeBook(book)
}

async function lookupBookById (book: BookID): Promise<Book> {
  const result = await fetch(`${baseUrl}/books/${book}`)
  if (result.ok) {
    return await result.json() as Book
  } else {
    throw new Error('Couldnt Find Book')
  }
}

export type ShelfId = string
export type OrderId = string

async function placeBooksOnShelf (bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  const result = await fetch(`${baseUrl}/warehouse/${bookId}/${shelf}/${numberOfBooks}`, { method: 'put' })
  if (!result.ok) {
    throw new Error('Couldnt Place on Shelf')
  }
}

async function orderBooks (order: BookID[]): Promise<{ orderId: OrderId }> {
  const result = await fetch(`${baseUrl}/order`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order })
  })
  if (!result.ok) {
    throw new Error('Couldnt Place on Shelf')
  }
  return { orderId: await result.text() }
}

async function findBookOnShelf (book: BookID): Promise<Array<{ shelf: ShelfId, count: number }>> {
  const result = await fetch(`${baseUrl}/warehouse/${book}`)
  if (result.ok) {
    const results = (await result.json()) as Record<ShelfId, number>
    const shelfArray: Array<{ shelf: ShelfId, count: number }> = []
    for (const shelf of Object.keys(results)) {
      shelfArray.push({
        shelf,
        count: results[shelf]
      })
    }
    return shelfArray
  } else {
    throw new Error('Couldnt Find Book')
  }
}

async function fulfilOrder (order: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }>): Promise<void> {
  const result = await fetch(`${baseUrl}/order/${order}/fulfil`, {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booksFulfilled })
  })
  if (!result.ok) {
    throw new Error(`Couldnt Fulfil ${await result.text()}`)
  }
}

async function listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
  const result = await fetch(`${baseUrl}/order`)
  if (result.ok) {
    return await result.json() as Array<{ orderId: OrderId, books: Record<BookID, number> }>
  } else {
    throw new Error('Couldnt Find Book')
  }
}

function isEmptyFilter (filter: Filter): boolean {
  return Object.values(filter).every(
    v => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
  )
}

const assignment = 'assignment-4'

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
  placeBooksOnShelf,
  orderBooks,
  findBookOnShelf,
  fulfilOrder,
  listOrders,
  lookupBookById
}
