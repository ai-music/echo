import { MongoClient } from 'mongodb'
import { ICollection, ICollectionBuilder } from '../types'

export class MongoDBService {
    public serviceName = 'MongoDBService'
    protected client: MongoClient = null
    protected collectionsBuilder: Map<string, ICollectionBuilder> = new Map()
    protected collections: Record<string, ICollection> = {}

    protected constructor(protected connectionString: string, protected appName: string) {
    }

    public static factory(connectionString: string, appName: string): MongoDBService {
        return new this(connectionString, appName)
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
            const [ collectionName, collectionClass ] = collectionBuilder
            const collection = new collectionClass(this.client, collectionName.toLowerCase(), collectionClass._schema)
            collection.createCollection().then(e => console.log(e))
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

}
