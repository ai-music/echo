import { MongoClient } from 'mongodb'
import { ICollection, ICollectionBuilder } from '../types'

export class MongoDBService {
    public serviceName = 'MongoDBService'
    protected client: MongoClient = null
    protected collectionsBuilder: Map<string, ICollectionBuilder> = new Map()
    protected collections: Record<string, ICollection> = {}

    protected constructor(protected connectionString: string, protected appName: string) {}

    public static factory(connectionString: string, appName: string): MongoDBService {
        return new this(connectionString, appName)
    }

    public static factoryFromBase64(connectionString64: string, appName: string): MongoDBService {
        return new this(Buffer.from(connectionString64, 'base64').toString(), appName)
    }

    public async connect(): Promise<MongoDBService> {
        if (this.client) {
            return this
        }
        await this.createConnection()
        await this.configureCollections()
    }

    public getClient(): MongoClient {
        if (!this.client) {
            throw Error('Connection is not created yet')
        }
        return this.client
    }

    protected async configureCollections(): Promise<void> {
        for (const collectionBuilder of this.collectionsBuilder) {
            const [collectionName, collectionClass] = collectionBuilder
            const collection = new collectionClass(this.client, collectionName.toLowerCase(), collectionClass.schema)
            await collection.createCollection()
            await collection.updateSchema()
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

    public getCollection<T extends ICollection>(collectionName: string): T {
        if (this.collections[collectionName]) {
            return this.collections[collectionName] as T
        }
        throw new TypeError(`No collection found with name ${collectionName}`)
    }
}
