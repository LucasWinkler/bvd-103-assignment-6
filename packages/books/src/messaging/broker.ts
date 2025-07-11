import { type Channel, type ChannelModel, connect } from 'amqplib'
import { type BookEvent, type Book } from '../documented_types'

let connection: ChannelModel | null = null
let channel: Channel | null = null

const CHANNEL_NAME = 'events'

export async function connectToBroker (): Promise<void> {
  if (connection !== null && channel !== null) {
    return
  }

  connection = await connect('amqp://rabbitmq')
  channel = await connection.createChannel()

  await channel.assertExchange(CHANNEL_NAME, 'topic', { durable: true })
  console.log('Books service connected to RabbitMQ messaging broker')
}

export async function publishBookAdded (book: Book): Promise<void> {
  if (channel === null) throw new Error('Not connected to books broker')

  const event: BookEvent = {
    type: 'BookAdded',
    timestamp: new Date(),
    data: book
  }

  channel.publish(CHANNEL_NAME, 'book.added', Buffer.from(JSON.stringify(event)))
  console.log('Published BookAdded event')
}

export async function publishBookUpdated (book: Book): Promise<void> {
  if (channel === null) throw new Error('Not connected to books broker')

  const event: BookEvent = {
    type: 'BookUpdated',
    timestamp: new Date(),
    data: book
  }

  channel.publish(CHANNEL_NAME, 'book.updated', Buffer.from(JSON.stringify(event)))
  console.log('Published BookUpdated event')
}

export async function publishBookDeleted (book: Book): Promise<void> {
  if (channel === null) throw new Error('Not connected to books broker')

  const event: BookEvent = {
    type: 'BookDeleted',
    timestamp: new Date(),
    data: book
  }

  channel.publish(CHANNEL_NAME, 'book.deleted', Buffer.from(JSON.stringify(event)))
  console.log('Published BookDeleted event')
}
