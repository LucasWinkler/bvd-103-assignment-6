import Koa from 'koa'
import cors from '@koa/cors'
import qs from 'koa-qs'
import zodRouter from 'koa-zod-router'
import { RegisterRoutes } from './build/routes'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { type Server, type IncomingMessage, type ServerResponse } from 'http'
import { type AppWarehouseDatabaseState, getDefaultWarehouseDatabase } from './src/data/warehouse_database'

export default async function (port?: number, randomizeDbs?: boolean): Promise<{ server: Server<typeof IncomingMessage, typeof ServerResponse>, state: AppWarehouseDatabaseState }> {
  const warehouseDb = await getDefaultWarehouseDatabase(randomizeDbs === true ? undefined : 'mcmasterful-warehouse')

  const state: AppWarehouseDatabaseState = {
    warehouse: warehouseDb
  }

  const app = new Koa< AppWarehouseDatabaseState, Koa.DefaultContext>()

  app.use(async (ctx, next): Promise<void> => {
    ctx.state = state
    await next()
  })

  // We use koa-qs to enable parsing complex query strings, like our filters.
  qs(app)

  // And we add cors to ensure we can access our API from the mcmasterful-books website
  app.use(cors())

  const router = zodRouter({ zodRouter: { exposeRequestErrors: true } })

  app.use(bodyParser())
  app.use(router.routes())

  const koaRouter = new KoaRouter()

  RegisterRoutes(koaRouter)

  app.use(koaRouter.routes())

  return {
    server: app.listen(port, () => {
      console.log('Warehouse service listening')
    }),
    state
  }
}
