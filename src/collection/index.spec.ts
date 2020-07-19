import { AbstractCollection } from './index'
import { MongoClient } from 'mongodb'
import { ICollectionConfig, IIndex, IMongoSchema } from '../types'
import { defaultCrudGateway } from './crud_gateway'

describe('AbstractCollection', () => {
    const TestClass = class extends AbstractCollection<any> {}
    const collectionName = 'my-collection'
    const schema: IMongoSchema = { $jsonSchema: { properties: {} } }
    const indexes: IIndex[] = []
    let testInstance: AbstractCollection<any>

    beforeAll(() => {
        const client = new MongoClient('test')
        const config: ICollectionConfig = {
            client,
            collectionName: collectionName.toLowerCase(),
            schema: schema,
            indexes: indexes,
            crudGateway: defaultCrudGateway
        }
        testInstance = new TestClass(config)
    })

    it('Should be extendable class', () => {
        expect(testInstance instanceof AbstractCollection).toBe(true)
    })

    it(`Should have collection name`, () => {
        expect(testInstance.collectionName).toBe(collectionName)
    })

    it(`Should have schema`, () => {
        expect(testInstance.schema).toBe(schema)
    })

    it(`Should have indexes`, () => {
        expect(Array.isArray(testInstance.indexes)).toBe(true)
    })

    it(`Should have gateway`, () => {
        expect(testInstance.crudGateway).toBe(defaultCrudGateway)
    })
})
