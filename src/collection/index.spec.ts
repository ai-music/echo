import { AbstractCollection } from './index'
import { MongoClient } from 'mongodb'

describe('AbstractCollection', () => {
    const TestClass = class extends AbstractCollection {}
    const schema = { $jsonSchema: { properties: {} } }
    const collectionName = 'my-collection'
    let testInstance: AbstractCollection

    beforeAll(() => {
        const client = new MongoClient('test')
        testInstance = new TestClass(client, collectionName, schema)
    })

    test('Should be extendable class', () => {
        expect(testInstance instanceof AbstractCollection).toBe(true)
    })

    test(`Should have collection name`, () => {
        expect(testInstance.collectionName).toBe(collectionName)
    })

    test(`Should have schema`, () => {
        expect(testInstance.schema).toBe(schema)
    })
})
