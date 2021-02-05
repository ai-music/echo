import { AbstractCollection } from './index'
import { MongoClient } from 'mongodb'
import { DEFAULT_PAGINATOR, ICollectionConfig, IIndex, IMongoSchema, IPaginatorInput } from '../types'
import { defaultCrudGateway } from './crud_gateway'

describe('AbstractCollection', () => {
    const TestClass = class extends AbstractCollection<any> {}
    const collectionName = 'my-collection'
    const schema: IMongoSchema = { $jsonSchema: { properties: {} } }
    const indexes: IIndex[] = []
    let testInstance: AbstractCollection<any>
    const document = {
        id: '1234-1234-1234',
        attribute: 'test',
        secondAttribute: 'secondAttribute'
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
        const list = await testInstance.findDocuments({ filters: t })
        expect(Array.isArray(list.data)).toBe(true)
    })

    it(`Should Find a collection of paginated documents passing the paginator input`, async () => {
        const t = { isValid: true }
        const paginator: IPaginatorInput = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
        const list = await testInstance.findPaginatedDocuments({ filters: t, paginator })
        expect(Array.isArray(list.data)).toBe(true)
        expect(list.paginator.total).toBe(2)
        expect(list.paginator.from).toBe(paginator.from)
        expect(list.paginator.size).toBe(paginator.size)
    })

    it(`Should Find a collection of paginated documents without the paginator input`, async () => {
        const t = { isValid: true }
        const list = await testInstance.findPaginatedDocuments({ filters: t })
        expect(Array.isArray(list.data)).toBe(true)
        expect(list.paginator.total).toBe(2)
        expect(list.paginator.total).toBe(2)
        expect(list.paginator.from).toBe(DEFAULT_PAGINATOR.FROM)
        expect(list.paginator.size).toBe(DEFAULT_PAGINATOR.SIZE)
    })

    it('Should return a collection with only the required fields', async () => {
        const t = { isValid: true }
        const p = ['attribute']
        const list = await testInstance.findPaginatedDocuments({ filters: t }, p)
        expect(Array.isArray(list.data)).toBe(true)
        expect(list.data[0].id).toBe('doc1')
        expect(list.data[0].attribute).toBe('test')
        expect(list.data[0].secondAttribute).toBeUndefined()
    })

    it('Should return a collection with all the fields', async () => {
        const t = { isValid: true }
        const list = await testInstance.findPaginatedDocuments({ filters: t })
        expect(Array.isArray(list.data)).toBe(true)
        expect(list.data[0].id).toBe('doc1')
        expect(list.data[0].attribute).toBe('test')
        expect(list.data[0].secondAttribute).toBe('secondAttribute')
    })

    it(`Should return an empty collection`, async () => {
        const t = { isValid: false }
        const list = await testInstance.findDocuments({ filters: t })
        expect(Array.isArray(list.data)).toBe(true)
    })

    it('Should delete many documents', async () => {
        const deletedDocument = await testInstance.deleteDocuments({ _id: document.id })
        expect(deletedDocument).toBe(undefined)
    })
})
