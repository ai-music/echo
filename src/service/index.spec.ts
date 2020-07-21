import { MongoDBService } from './index'
import { MongoClient } from 'mongodb'
import { AbstractCollection } from '../collection'
import { Collection, IndexUnique } from '../decorators'

jest.mock('mongodb')

@Collection
class TestCollection extends AbstractCollection<any> {
    @IndexUnique()
    protected email: string
}

describe('Service', () => {
    it(`Should have factory`, async () => {
        expect(typeof MongoDBService.factory).toBe('function')
    })

    it(`Should be a valid instance`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        expect(service instanceof MongoDBService).toBe(true)
    })

    it(`Should be able to create a connection`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        const connection = await service.connect()
        expect(connection instanceof MongoDBService).toBe(true)
    })

    it(`Should not create multiple instances`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        const connectionOne = await service.connect()
        const connectionTwo = await service.connect()
        expect(connectionOne).toBe(connectionTwo)
    })

    it(`Should be able to return the mongodb client`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        await service.connect()
        expect(service.getClient() instanceof MongoClient).toBe(true)
    })

    it(`Should fail to retrieve mongodb client if not connected `, () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        expect(() => service.getClient()).toThrow('Connection is not created yet')
    })

    it(`Should have factory from base64 string`, async () => {
        const string = 'HelloConnection'
        const connectionString = Buffer.from(string).toString('base64')
        const service = MongoDBService.factoryFromBase64(connectionString, 'appName')
        expect(service.connectionString === string).toBe(true)
    })

    it(`Should fail retrieving a registered collection without connection`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        service.registerCollection(TestCollection)
        expect(() => service.getCollection(TestCollection.name)).toThrow('Connection is not created yet')
    })

    it(`Should retrieve a register collection`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        service.registerCollection(TestCollection)
        await service.connect()
        const collection = service.getCollection(TestCollection.name)
        expect(collection instanceof TestCollection).toBe(true)
    })

    it(`Should fail retrieving a not register collection`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        await service.connect()
        expect(() => service.getCollection(TestCollection.name)).toThrow('No collection found with name TestCollection')
    })

    it(`Should catch an error in case of connection failure`, async () => {
        const service = MongoDBService.factory('pleaseFail', 'appName')
        const error = await service.connect().catch((e) => e.message)
        expect(error === 'MongoDB connection error: - false -').toBe(true)
    })

    it(`Should be able to close the connection`, async () => {
        const service = MongoDBService.factory('test/connection', 'appName')
        await service.connect()
        const disconnect = await service.disconnect()
        expect(disconnect).toBe(undefined)
    })
})
