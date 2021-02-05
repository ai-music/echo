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
            collections: (): Promise<any[]> => Promise.resolve([]),
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
                find: (query?: any): object => ({
                    project: (project?: { fields: any }): object => ({
                        skip: (): object => ({
                            limit: (): object => ({
                                toArray: (): Promise<any> => {
                                    let array: any[] = query?.isValid
                                        ? [
                                              { id: 'doc1', attribute: 'test', secondAttribute: 'secondAttribute' },
                                              { id: 'doc2', attribute: 'test', secondAttribute: 'secondAttribute' }
                                          ]
                                        : []
                                    if (project?.fields && Object.keys(project.fields).length) {
                                        array = [
                                            { id: 'doc1', attribute: 'test' },
                                            { id: 'doc2', attribute: 'test' }
                                        ]
                                    }
                                    return Promise.resolve(array)
                                }
                            })
                        }),
                        toArray: (): Promise<any> => Promise.resolve([{ id: 'doc1' }, { id: 'doc2' }])
                    }),

                    toArray: (): Promise<any> => Promise.resolve([{ id: 'doc1' }, { id: 'doc2' }])
                }),
                findOneAndUpdate: (query: any, document: any): Promise<any> => {
                    if (document.$set?.pleaseFail) {
                        return Promise.reject('findOneAndUpdate error')
                    }

                    if (document.$set?.pleaseFailWeird) {
                        return Promise.resolve(document)
                    }
                    return query._id ? Promise.resolve({ value: document.$set }) : Promise.resolve(false)
                },
                deleteMany: (query: any): Promise<any> => Promise.resolve(query),
                countDocuments: (query: any): Promise<any> => (query.isValid ? Promise.resolve(2) : Promise.resolve(0))
            })
        }
    }
}

export default mongodb
