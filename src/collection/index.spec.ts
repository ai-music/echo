import { AbstractCollection } from './index'
import { MongoClient } from 'mongodb'
import { DEFAULT_PAGINATOR, ICollectionConfig, IIndex, IMongoSchema, IPaginator } from '../types'
import { defaultCrudGateway } from './crud_gateway'

describe('AbstractCollection', () => {
    const TestClass = class extends AbstractCollection<any> {}
    const collectionName = 'my-collection'
    const schema: IMongoSchema = { $jsonSchema: { properties: {} } }
    const indexes: IIndex[] = []
    let testInstance: AbstractCollection<any>
    const document = {
        id: '1234-1234-1234',
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

    it(`Should return a not valid response from mongo`, async () => {
        const t = { ...document, pleaseFailWeird: true }
        const createDocument = await testInstance.createDocument(t).catch((e) => e.message)
        expect(createDocument).toBe('Create document error - response from MongoDB is not valid')
    })

    it(`Update document`, async () => {
        const createDocument = await testInstance.createDocument(document)
        const updateDocument = await testInstance.updateDocument({ _id: createDocument.id }, { attribute: 'updated' })
        expect(updateDocument.attribute).toBe('updated')
    })

    it(`Update document failure`, async () => {
        const t = { ...document, pleaseFail: true }
        const updateDocument = await testInstance.updateDocument({ _id: t.id }, t).catch((e) => e)
        expect(updateDocument).toBe('findOneAndUpdate error')
    })

    it(`Should return a not valid response from mongo`, async () => {
        const t = { ...document, pleaseFailWeird: true }
        const updateDocument = await testInstance.updateDocument({ _id: t.id }, t).catch((e) => e.message)
        expect(updateDocument).toBe('Update document error - response from MongoDB is not valid')
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
        const paginator: IPaginator = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
        const list = await testInstance.findDocuments({ filter: t, paginator })
        expect(Array.isArray(list.documents)).toBe(true)
        expect(list.total).toBe(2)
    })

    it(`Should Find a collection of documents`, async () => {
        const list = await testInstance.findDocuments()
        expect(Array.isArray(list.documents)).toBe(true)
        expect(list.total).toBe(2)
    })

    it(`Should return an empty collection`, async () => {
        const t = { isValid: false }
        const paginator: IPaginator = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
        const list = await testInstance.findDocuments({ filter: t, paginator })
        expect(Array.isArray(list.documents)).toBe(true)
        expect(list.total).toBe(0)
    })

    it('Should delete many documents', async () => {
        const deletedDocument = await testInstance.deleteDocuments({ _id: document.id })
        expect(deletedDocument).toBe(undefined)
    })
})
