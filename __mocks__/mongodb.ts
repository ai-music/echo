const mongodb = jest.genMockFromModule('mongodb')

export class MongoClient {
    public static connect(connectionString: string): Promise<MongoClient> {
        return connectionString === 'pleaseFail' ? Promise.reject(false) : Promise.resolve(new MongoClient())
    }

    public close(): Promise<void> {
        return Promise.resolve()
    }

    public db(): object {
        return {
            createCollection: (): Promise<boolean> => Promise.resolve(true),
            command: (): Promise<boolean> => Promise.resolve(true),
            collection: (): object => ({
                createIndex: (): Promise<boolean> => Promise.resolve(true),
                insertOne: (document: any): Promise<any> => {
                    if (document?.pleaseFail) {
                        return Promise.reject('insertOne error')
                    }
                    if (document?.pleaseFailWeird) {
                        return Promise.resolve(document)
                    }
                    return Promise.resolve({ ops: [document] })
                },
                findOne: (query: any): Promise<any> => (query.id ? Promise.resolve(query) : Promise.resolve(false)),
                find: (query: any): object => ({
                    toArray: (): Promise<any> =>
                        query.isValid ? Promise.resolve([{ id: 'doc1' }, { id: 'doc2' }]) : Promise.resolve([])
                })
            })
        }
    }
}

export default mongodb
