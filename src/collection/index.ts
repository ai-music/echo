import { Collection, MongoClient } from 'mongodb'
import { ICollection, IMongoSchema } from '../types'

export abstract class AbstractCollection implements ICollection {
    constructor(protected client: MongoClient, public collectionName: string, public schema: IMongoSchema) {}

    public createCollection<T>(): Promise<Collection<T>> {
        return this.client.db().createCollection(this.collectionName, { validator: this.schema })
    }

    public updateSchema<T>(): Promise<Collection<T>> {
        return this.client.db().command({ collMod: this.collectionName, validator: this.schema })
    }

    public async findOne<T>(filter: object): Promise<T | null> {
        const result = await this.client.db().collection(this.collectionName).findOne(filter)
        if (!result) {
            return null
        }
        return this.normaliseId<T>(result)
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected normaliseId<T>(input: any): T {
        const { _id: id, ...rest } = input
        return { ...rest, id }
    }
}
