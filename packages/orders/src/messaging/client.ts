import { type Channel, type ChannelModel, connect } from 'amqplib'
import { type FulfilledBook } from '../documented_types'
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
  console.log('Orders service connected to RabbitMQ messaging broker')
}

export async function publishOrderFulfilled (fulfilledBook: FulfilledBook): Promise<void> {
  if (channel === null) throw new Error('Not connected to orders broker')

  const event: OrderFulfilledEvent = {
    type: 'OrderFulfilled',
    timestamp: new Date(),
    data: fulfilledBook
  }

  channel.publish(CHANNEL_NAME, 'order.fulfilled', Buffer.from(JSON.stringify(event)))
  console.log('Published OrderFulfilled event')
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

  console.log('Orders service disconnected from RabbitMQ messaging broker')
}
