import { type ZodRouter } from 'koa-zod-router'
import deleteBook from './delete'
import getBookRoute from './lookup'
import { type BookDatabaseAccessor } from '../data/database_access'

// TODO: Probably convert this to tsoa routes
export function setupBookRoutes (router: ZodRouter, books: BookDatabaseAccessor): void {
  // Setup Book Delete Route
  deleteBook(router, books)

  // Lookup Book
  getBookRoute(router, books)
}
