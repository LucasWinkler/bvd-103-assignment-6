import { type Channel, type ChannelModel, connect } from 'amqplib'
import { handleFulfilOrderEvent } from './fulfil_order'
import { type WarehouseData } from '../data/warehouse_data'
import { type OrderFulfilledEvent } from './events'

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
        default:
          console.warn(`Unhandled event type: ${event.type}`)
      }
    }
  }, { noAck: true })

  console.log('Warehouse service connected to RabbitMQ messaging broker')
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
