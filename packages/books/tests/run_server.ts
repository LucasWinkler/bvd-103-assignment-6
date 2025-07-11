import { afterEach, beforeEach } from 'vitest'
import server from '../server'
import { type AppBookDatabaseState } from '../src/data/database_access'

export interface ServerTestContext {
  address: string
  state: AppBookDatabaseState
  closeServer: () => void
}

export default function (): void {
  beforeEach<ServerTestContext>(async (context) => {
    const { server: instance, state } = await server()
    const address = instance.address()
    if (typeof address === 'string') {
      context.address = `http://${address}`
    } else if (address !== null) {
      context.address = `http://localhost:${address.port}`
    } else {
      throw new Error('couldnt set up server')
    }
    context.state = state
    context.closeServer = () => {
      instance.close()
    }
  })

  afterEach<ServerTestContext>(async (context) => {
    context.closeServer()
  })
}
