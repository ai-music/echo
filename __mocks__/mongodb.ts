const mongodb = jest.genMockFromModule('mongodb')

export class MongoClient {
    public static connect(connectionString: string): Promise<MongoClient> {
        if (connectionString === 'pleaseFail') {
            return Promise.reject(false)
        }
        return Promise.resolve(new MongoClient())
    }

    public db(): object {
        return {
            createCollection: (): Promise<boolean> => Promise.resolve(true),
            command: (): Promise<boolean> => Promise.resolve(true),
            collection: (): object => ({
                createIndex: (): Promise<boolean> => Promise.resolve(true)
            })
        }
    }
}

export default mongodb
