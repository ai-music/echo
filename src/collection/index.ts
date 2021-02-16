import { Collection, FilterQuery, MongoClient } from 'mongodb'
import {
    DEFAULT_PAGINATOR,
    ICollection,
    ICollectionConfig,
    ICrudGateway,
    IDocumentsResponse,
    IFindDocumentsInput,
    IFindPaginatedDocuments,
    IIndex,
    IMongoSchema,
    IPaginatedDocumentsResponse
} from '../types'

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

    public async updateDocument(filters: FilterQuery<T>, document: Partial<T>): Promise<T> {
        const { filters: filterCrud, document: documentCrud } = this.crudGateway.update.before({ filters, document })
        const response = await this.getCollection().findOneAndUpdate(
            filterCrud,
            { $set: documentCrud },
            { returnOriginal: false }
        )
        if (!response.value) {
            throw new Error('Update document error - response from MongoDB is not valid')
        }
        return this.crudGateway.update.after(response.value)
    }

    public async findDocument(filters: FilterQuery<T>, fieldsToPopulate?: string[]): Promise<T | null> {
        const projection = fieldsToPopulate ? this.populateFields(fieldsToPopulate) : {}
        const result = await this.getCollection().findOne(this.crudGateway.read.before(filters), { projection })
        if (!result) {
            return null
        }
        return this.crudGateway.read.after(result)
    }

    public async findDocuments(
        findDocumentInput?: IFindDocumentsInput<T>,
        fieldsToPopulate?: string[]
    ): Promise<IDocumentsResponse<T>> {
        const filters: Record<string, unknown> = findDocumentInput?.filters || {}
        const fields = fieldsToPopulate ? this.populateFields(fieldsToPopulate) : {}
        const result = await this.getCollection()
            .find(this.crudGateway.list.before(filters))
            .project({ ...fields })
            .toArray()
        return {
            data: this.crudGateway.list.after(result)
        }
    }

    public async findPaginatedDocuments(
        findPaginatedDocumentInput?: IFindPaginatedDocuments<T>,
        fieldsToPopulate?: string[]
    ): Promise<IPaginatedDocumentsResponse<T>> {
        const { paginator, filters } = findPaginatedDocumentInput
        const skip = paginator?.from || DEFAULT_PAGINATOR.FROM
        const limit = paginator?.size || DEFAULT_PAGINATOR.SIZE
        const inputFilters = filters || {}
        const fields = fieldsToPopulate ? this.populateFields(fieldsToPopulate) : {}

        const result = findPaginatedDocumentInput
            ? await this.getCollection()
                  .find(this.crudGateway.list.before(inputFilters))
                  .project({ ...fields })
                  .skip(skip)
                  .limit(limit)
                  .toArray()
            : await this.getCollection()
                  .find(this.crudGateway.list.before(inputFilters))
                  .project({ ...fields })
                  .toArray()

        return {
            data: this.crudGateway.list.after(result),
            paginator: {
                total: result.length,
                from: skip,
                size: limit
            }
        }
    }

    public async deleteDocuments(filter?: FilterQuery<T>): Promise<void> {
        const result = await this.getCollection().deleteMany(this.crudGateway.delete.before(filter))
        this.crudGateway.delete.after(result)
    }

    public getCollection(): Collection {
        return this.client.db().collection(this.collectionName)
    }

    public populateFields(fields: string[]): Record<string, number> {
        let fieldsToReturn = {}
        fields.forEach((key) => {
            fieldsToReturn = {
                ...fieldsToReturn,
                [key]: 1
            }
        })
        return fieldsToReturn
    }
}
