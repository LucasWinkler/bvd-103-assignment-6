import { ObjectId } from 'mongodb'
import { type BookDatabaseAccessor } from '../data/database_access'
import { type Book, type BookID } from '../documented_types'
import { publishBookAdded, publishBookUpdated } from '../messaging/broker'

export default async function createOrUpdateBook (book: Book, books: BookDatabaseAccessor): Promise<BookID | false> {
  const { books: bookCollection } = books
  const body = book

  if (typeof body.id === 'string') {
    const id = body.id
    const result = await bookCollection.findOneAndReplace({ _id: { $eq: ObjectId.createFromHexString(id) } }, {
      id,
      name: body.name,
      description: body.description,
      price: body.price,
      author: body.author,
      image: body.image
    }, { returnDocument: 'after' })

    if (result !== null) {
      await publishBookUpdated(result)
      return id
    } else {
      return false
    }
  } else {
    const newBook: Omit<Book, 'id'> = {
      name: body.name,
      description: body.description,
      price: body.price,
      author: body.author,
      image: body.image
    }

    const result = await bookCollection.insertOne(newBook)
    if (result.insertedId === null) {
      return false
    }

    await publishBookAdded({
      id: result.insertedId.toHexString(),
      ...newBook
    })

    return result.insertedId.toHexString()
  }
}
