import { MongoDBService } from '../src/service'
import { Cars } from './collections/users'

describe('Service', () => {
    let service: MongoDBService = null

    beforeAll(async () => {
        const connection = 'mongodb://echo-mongodb-tests:27017/tests'
        service = MongoDBService.factory(connection, 'tests')
        service.registerCollection(Cars)
        await service.connect()
    }, 10_000)

    afterAll(async () => {
        await service.disconnect()
    })

    it(`Should build a simple collection`, async () => {
        const cars = service.getCollection<Cars>(Cars.name)
        expect(cars).toBeInstanceOf(Cars)
    })

    it(`Creat a car`, async () => {
        const cars = service.getCollection<Cars>(Cars.name)
        const car = await cars.createDocument({
            model: 123,
            name: '500 FIAT',
            productionDate: new Date()
        })
        expect(car).toHaveProperty('name')
        expect(car).toHaveProperty('model')
        expect(car).toHaveProperty('productionDate')
        expect(typeof car.name).toBe('string')
        expect(typeof car.model).toBe('number')
        expect(car.productionDate).toBeInstanceOf(Date)
    })
})
