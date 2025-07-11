import { type Channel, type ChannelModel, connect } from 'amqplib'
import { type Book, type BookID, type BookDeletedEvent, type BookUpdatedEvent, type BookAddedEvent } from '../documented_types'

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

  const event: BookAddedEvent = {
    type: 'BookAdded',
    timestamp: new Date(),
    data: book
  }

  channel.publish(CHANNEL_NAME, 'book.added', Buffer.from(JSON.stringify(event)))
  console.log('Published BookAdded event')
}

export async function publishBookUpdated (book: Book): Promise<void> {
  if (channel === null) throw new Error('Not connected to books broker')

  const event: BookUpdatedEvent = {
    type: 'BookUpdated',
    timestamp: new Date(),
    data: book
  }

  channel.publish(CHANNEL_NAME, 'book.updated', Buffer.from(JSON.stringify(event)))
  console.log('Published BookUpdated event')
}

export async function publishBookDeleted (bookId: BookID): Promise<void> {
  if (channel === null) throw new Error('Not connected to books broker')

  const event: BookDeletedEvent = {
    type: 'BookDeleted',
    timestamp: new Date(),
    data: bookId
  }

  channel.publish(CHANNEL_NAME, 'book.deleted', Buffer.from(JSON.stringify(event)))
  console.log('Published BookDeleted event')
}

export async function closeBroker (): Promise<void> {
  if (channel !== null) {
    await channel.close()
    channel = null
  }

  if (connection !== null) {
    await connection.close()
    connection = null
  }

  console.log('Books service disconnected from RabbitMQ messaging broker')
}
