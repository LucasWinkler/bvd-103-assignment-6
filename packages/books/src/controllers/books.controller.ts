import type * as koa from 'koa'
import { Controller, Route, Request, Body, Post } from 'tsoa'
import { type BookID, type Book, type Filter } from '../documented_types'
import { type AppBookDatabaseState } from '../data/database_access'
import listBooks from '../services/list'
import createOrUpdateBook from '../services/create_or_update'

@Route('books')
export class BooksRoutes extends Controller {
  @Post('list')
  public async listBooks (@Body() filters: Filter[], @Request() request: koa.Request): Promise<Book[]> {
    const ctx: koa.ParameterizedContext<AppBookDatabaseState, koa.DefaultContext> = request.ctx
    return await listBooks(ctx.state.books, filters)
  }

  @Post()
  public async createOrUpdateBook (@Body() book: Book, @Request() request: koa.Request): Promise<{ id: BookID }> {
    const ctx: koa.ParameterizedContext<AppBookDatabaseState, koa.DefaultContext> = request.ctx
    const result = await createOrUpdateBook(book, ctx.state.books)

    if (result !== false) {
      return { id: result }
    } else {
      this.setStatus(404)
      return { id: book.id ?? '' }
    }
  }
}
