import Koa from 'koa'
import cors from '@koa/cors'
import swagger from './build/swagger.json'
import { koaSwagger } from 'koa2-swagger-ui'
import { type Server, type IncomingMessage, type ServerResponse } from 'http'

export default async function (
  port?: number
): Promise<{ server: Server<typeof IncomingMessage, typeof ServerResponse> }> {
  const app = new Koa()

  // And we add cors to ensure we can access our API from the mcmasterful-books website
  app.use(cors())

  app.use(
    koaSwagger({
      routePrefix: '/docs',
      specPrefix: '/docs/spec',
      exposeSpec: true,
      swaggerOptions: {
        spec: swagger
      }
    })
  )
  return {
    server: app.listen(port, () => {
      console.log('Docs service listening')
    })
  }
}
