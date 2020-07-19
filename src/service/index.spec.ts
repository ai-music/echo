import { MongoDBService } from './index'
import { MongoClient } from 'mongodb'

jest.mock('mongodb')

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
})
