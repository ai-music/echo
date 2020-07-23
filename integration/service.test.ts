import { MongoDBService } from '../src/service'
import { Cars } from './collections/cars'
import { Users } from './collections/users'
import { Dogs } from './collections/dogs'

describe('Service', () => {
    let service: MongoDBService = null

    beforeAll(async () => {
        const connection = 'mongodb://echo-mongodb-tests:27017/tests'
        service = MongoDBService.factory(connection, 'tests')
        service.registerCollection(Cars)
        service.registerCollection(Users)
        service.registerCollection(Dogs)
        await service.connect()
    }, 30_000)

    afterAll(async () => {
        await service.disconnect()
    })

    describe('Simple collection', () => {
        it(`Should build a simple collection`, async () => {
            const cars = service.getCollection<Cars>(Cars.name)
            expect(cars).toBeInstanceOf(Cars)
        })

        it(`Create a car`, async () => {
            const cars = service.getCollection<Cars>(Cars.name)
            const car = await cars.createDocument({
                model: 123,
                name: '500 FIAT',
                productionDate: new Date()
            })
            expect(car).toHaveProperty('_id')
            expect(car).toHaveProperty('name')
            expect(car).toHaveProperty('model')
            expect(car).toHaveProperty('productionDate')
            expect(typeof car.name).toBe('string')
            expect(typeof car.model).toBe('number')
            expect(car.productionDate).toBeInstanceOf(Date)
        })

        it(`Should delete all cars`, async () => {
            const cars = service.getCollection<Cars>(Cars.name)
            const allCars = await cars.findDocuments()
            const ids = allCars.map((car) => car._id)
            await cars.deleteDocuments({ _id: { $in: ids } })
            const allCarsAfterDelete = await cars.findDocuments()
            expect(allCarsAfterDelete).toHaveLength(0)
        })
    })

    describe('Unique index', () => {
        const user = {
            firstName: 'Mario',
            lastName: 'Bros',
            email: 'mario@bros.com'
        }

        it(`Should create a user`, async () => {
            const users = service.getCollection<Users>(Users.name)
            const newUser = await users.createDocument(user)
            expect(newUser).toHaveProperty('_id')
        })

        it(`Should Fail because of duplicate key`, async () => {
            const users = service.getCollection<Users>(Users.name)
            const error = await users.createDocument(user).catch((e) => e.message)
            expect(error).toContain('E11000 duplicate key error collection')
        })
    })

    describe('UUID crudGateway', () => {
        const dog = {
            name: 'Fido',
            breed: 'Australian Kelpie',
            birthDate: new Date()
        }

        it(`Should create a dog`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const newDog = await dogs.createDocument(dog)
            expect(newDog).toHaveProperty('id')
        })

        it(`Should find a dog (id)`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const fido = await dogs.findDocument({ name: dog.name })
            expect(fido).toHaveProperty('id')
        })

        it(`Should find all the dogs (id)`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const allDogs = await dogs.findDocuments()
            expect(Array.isArray(allDogs)).toBe(true)
            expect(allDogs[0]).toHaveProperty('id')
        })
    })
})
