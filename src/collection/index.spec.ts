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
    const document = {
        attribute: 'test'
    }

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

    it(`Create document`, async () => {
        const createDocument = await testInstance.createDocument(document)
        expect(createDocument.attribute).toBe('test')
    })

    it(`Create document failure`, async () => {
        const t = { ...document, pleaseFail: true }
        const createDocument = await testInstance.createDocument(t).catch((e) => e)
        expect(createDocument).toBe('insertOne error')
    })

    it(`Should return a a not valid response from mongo`, async () => {
        const t = { ...document, pleaseFailWeird: true }
        const createDocument = await testInstance.createDocument(t).catch((e) => e.message)
        expect(createDocument).toBe('Create document error - response from MongoDB is not valid')
    })

    it(`Should find a valid document`, async () => {
        const t = { id: 'valid' }
        const createDocument = await testInstance.findDocument(t)
        expect(createDocument).toBe(t)
    })

    it(`Should not find anything`, async () => {
        const t = { test: 'invalid' }
        const createDocument = await testInstance.findDocument(t)
        expect(createDocument).toBe(null)
    })

    it(`Should Find a collection of documents`, async () => {
        const t = { isValid: true }
        const list = await testInstance.findDocuments(t)
        expect(Array.isArray(list)).toBe(true)
        expect(list.length).toBe(2)
    })

    it(`Should return an empty collection`, async () => {
        const t = { isValid: false }
        const list = await testInstance.findDocuments(t)
        expect(Array.isArray(list)).toBe(true)
        expect(list.length).toBe(0)
    })
})
