const mongodb = jest.genMockFromModule('mongodb')

export class MongoClient {
    public static connect(): Promise<MongoClient> {
        return Promise.resolve(new MongoClient())
    }

    public db(): object {
        return {
            createCollection: (): Promise<boolean> => Promise.resolve(true),
            command: (): Promise<boolean> => Promise.resolve(true)
        }
    }
}

export default mongodb
