import { Collection, FilterQuery, MongoClient } from 'mongodb'
import { ICollection, ICollectionConfig, ICrudGateway, IIndex, IMongoSchema } from '../types'

export abstract class AbstractCollection<T> implements ICollection<T> {
    public collectionName: string
    public schema: IMongoSchema
    public indexes: IIndex[]
    public client: MongoClient
    public crudGateway: ICrudGateway

    constructor(config: ICollectionConfig) {
        this.collectionName = config.collectionName
        this.client = config.client
        this.indexes = config.indexes
        this.schema = config.schema
        this.crudGateway = config.crudGateway
    }

    public createCollection(): Promise<Collection<T>> {
        return this.client.db().createCollection(this.collectionName, { validator: this.schema })
    }

    public updateSchema(): Promise<Collection<T>> {
        return this.client.db().command({ collMod: this.collectionName, validator: this.schema })
    }

    public createIndex(indexConfig: object[]): Promise<string> {
        const [key, config] = indexConfig
        return this.getCollection().createIndex(key, config)
    }

    public async createDocument(document: Partial<T>): Promise<T> {
        const response = await this.getCollection().insertOne(this.crudGateway.create.before(document))
        if (!Array.isArray(response.ops)) {
            throw new Error('Create document error - response from MongoDB is not valid')
        }
        return this.crudGateway.create.after(response.ops[0])
    }

    public async findDocument(filter: FilterQuery<T>): Promise<T | null> {
        const result = await this.getCollection().findOne(this.crudGateway.read.before(filter))
        if (!result) {
            return null
        }
        return this.crudGateway.read.after(result)
    }

    public async findDocuments(filter?: FilterQuery<T>): Promise<T[]> {
        const result = await this.getCollection().find(this.crudGateway.list.before(filter)).toArray()
        return this.crudGateway.list.after(result)
    }

    public async deleteDocuments(filter?: FilterQuery<T>): Promise<void> {
        await this.getCollection().deleteMany(this.crudGateway.delete.before(filter))
    }

    protected getCollection(): Collection {
        return this.client.db().collection(this.collectionName)
    }
}
