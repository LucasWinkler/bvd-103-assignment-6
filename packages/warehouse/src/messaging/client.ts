import { type Channel, type ChannelModel, connect } from 'amqplib'
import { handleFulfilOrderEvent } from './fulfil_order'
import { type WarehouseData } from '../data/warehouse_data'
import { type OrderFulfilledEvent } from './events'

let connection: ChannelModel | null = null
let channel: Channel | null = null

const CHANNEL_NAME = 'events'

export async function connectToMessagingClient (): Promise<void> {
  if (connection !== null && channel !== null) {
    return
  }

  connection = await connect('amqp://rabbitmq')
  channel = await connection.createChannel()

  await channel.assertExchange(CHANNEL_NAME, 'topic', { durable: true })
  await channel.consume(CHANNEL_NAME, (msg) => {
    console.log(`Received event: ${msg?.fields.routingKey} - ${msg?.content.toString()}`)
    if (msg !== null) {
      const event = JSON.parse(msg.content.toString())
      switch (event.type) {
        case 'OrderFulfilled':
          console.log(`Order fulfilled: ${event}`)
          handleFulfilOrderEvent(event.data as WarehouseData, event as OrderFulfilledEvent).catch(console.error)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
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
