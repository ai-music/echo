import { defaultCrudGateway, uuidCrudGateway, Field, Collection, AbstractCollection, MongoDBService } from './index'

describe('Package', () => {
    it(`Test exports`, async () => {
        expect(typeof defaultCrudGateway).toBe('object')
        expect(typeof uuidCrudGateway).toBe('object')
        expect(typeof Field).toBe('function')
        expect(typeof Collection).toBe('function')
        expect(typeof AbstractCollection).toBe('function')
        expect(typeof MongoDBService).toBe('function')
    })
})
