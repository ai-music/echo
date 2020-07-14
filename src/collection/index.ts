import { Collection, MongoClient } from 'mongodb'
import { ICollection, IMongoSchema } from '../types'

export abstract class AbstractCollection implements ICollection {

    constructor(protected client: MongoClient, protected collectionName: string, public schema: IMongoSchema) {
    }

    public createCollection<T>(): Promise<Collection<T>> {
        console.log(this.schema)
        return this.client
            .db()
            .createCollection(this.collectionName, { validator: this.schema })
    }
}