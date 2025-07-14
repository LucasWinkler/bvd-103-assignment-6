import { type Channel, type ChannelModel, connect } from 'amqplib'
import { handleBookDeletedEvent, handleFulfilOrderEvent } from './handlers'
import { type WarehouseData } from '../data/warehouse_data'
import { type BookDeletedEvent, type BookStockedEvent, type OrderFulfilledEvent } from './events'
import { type BookID } from '../documented_types'

let connection: ChannelModel | null = null
let channel: Channel | null = null

const EXCHANGE_NAME = 'events'
const QUEUE_NAME = 'warehouse-queue'

export async function connectToMessagingClient (data: WarehouseData): Promise<void> {
  if (connection !== null && channel !== null) {
    return
  }

  connection = await connect('amqp://rabbitmq')
  channel = await connection.createChannel()

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true })

  await channel.assertQueue(QUEUE_NAME, { durable: true })
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, '#')

  await channel.consume(QUEUE_NAME, (msg) => {
    if (msg !== null) {
      const event = JSON.parse(msg.content.toString())

      switch (event.type) {
        case 'OrderFulfilled':
          handleFulfilOrderEvent(data, event as OrderFulfilledEvent).catch(console.error)
          break
        case 'BookDeleted':
          handleBookDeletedEvent(data, event as BookDeletedEvent).catch(console.error)
          break
        default:
          console.warn(`Unhandled event type: ${event.type}`)
      }
    }
  }, { noAck: true })

  console.log('Warehouse service connected to RabbitMQ messaging broker')
}

export async function publishBookStocked ({ bookId, stock }: { bookId: BookID, stock: number }): Promise<void> {
  if (channel === null) throw new Error('Not connected to warehouse broker')

  const event: BookStockedEvent = {
    type: 'BookStocked',
    timestamp: new Date(),
    data: { bookId, stock }
  }

  channel.publish(EXCHANGE_NAME, 'warehouse.book_stocked', Buffer.from(JSON.stringify(event)))
  console.log('Published BookStocked event')
}

export async function closeMessagingClient (): Promise<void> {
  if (channel !== null) {
    await channel.close()
    channel = null
  }

  if (connection !== null) {
    await connection.close()
    connection = null
  }

  console.log('Warehouse service disconnected from RabbitMQ messaging broker')
}
