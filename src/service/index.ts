import { MongoClient } from 'mongodb'
import { ICollection, ICollectionBuilder, ICollectionConfig, IIndex } from '../types'
import { defaultCrudGateway } from '../collection/crud_gateway'

export class MongoDBService {
    public serviceName = 'MongoDBService'
    protected client: MongoClient = null
    protected collectionsBuilder: Map<string, ICollectionBuilder> = new Map()
    protected collections: Record<string, ICollection<unknown>> = {}

    protected constructor(public connectionString: string, protected appName: string) {}

    public static factory(connectionString: string, appName: string): MongoDBService {
        return new this(connectionString, appName)
    }

    public static factoryFromBase64(connectionString64: string, appName: string): MongoDBService {
        return new this(Buffer.from(connectionString64, 'base64').toString('ascii'), appName)
    }

    public async connect(): Promise<MongoDBService> {
        if (this.client) {
            return this
        }
        await this.createConnection()
        await this.configureCollections()
        return this
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close()
        }
    }

    public getClient(): MongoClient {
        if (!this.client) {
            throw Error('Connection is not created yet')
        }
        return this.client
    }

    protected async configureCollections(): Promise<void> {
        const collections = await this.client.db().collections()
        for (const collectionBuilder of this.collectionsBuilder) {
            const [collectionName, CollectionClass] = collectionBuilder
            const config: ICollectionConfig = {
                client: this.client,
                collectionName: collectionName.toLowerCase(),
                schema: CollectionClass.schema,
                indexes: CollectionClass.indexes || [],
                crudGateway: CollectionClass.crudGateway || defaultCrudGateway
            }
            const collection = new CollectionClass(config)
            if (!collections.find((collection) => collection.collectionName === collectionName.toLowerCase())) {
                //TODO @team DT-1790 - Fix create collection error -
                await collection
                    .createCollection()
                    .catch((error) => console.log(`CreateCollection error: - ${error} -`))
            }
            await collection.updateSchema()
            await Promise.all(collection.indexes.map((index: IIndex) => collection.createIndex(index.config)))
            this.collections[collectionName] = collection
        }
    }

    protected async createConnection(): Promise<void> {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            appname: this.appName
        }
        this.client = await MongoClient.connect(this.connectionString, options).catch((error) => {
            throw new Error(`MongoDB connection error: - ${JSON.stringify(error)} -`)
        })
    }

    public registerCollection(collection: ICollectionBuilder): void {
        this.collectionsBuilder.set(collection.name, collection)
    }

    public getCollection<T extends ICollection<any>>(collectionName: string): T {
        this.getClient()
        if (this.collections[collectionName]) {
            return this.collections[collectionName] as T
        }
        throw new TypeError(`No collection found with name ${collectionName}`)
    }
}
