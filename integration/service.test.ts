import { MongoDBService } from '../src/service'
import { Cars } from './collections/cars'
import { Users } from './collections/users'
import { Dogs } from './collections/dogs'
import { DEFAULT_PAGINATOR, IPaginator } from '../src'

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
                model: 1,
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

        it('Should update the car', async () => {
            const cars = service.getCollection<Cars>(Cars.name)
            const car = await cars.createDocument({
                model: 2,
                name: '500 FIAT',
                productionDate: new Date()
            })
            const updatedCar = await cars.updateDocument({ _id: car._id }, { ...car, model: 200 })
            expect(updatedCar.model).toBe(200)
        })

        it('should list all the cars', async () => {
            const cars = service.getCollection<Cars>(Cars.name)
            await cars.createDocument({
                model: 3,
                name: '500 FIAT',
                productionDate: new Date()
            })
            await cars.createDocument({
                model: 4,
                name: '500 FIAT',
                productionDate: new Date()
            })
            await cars.createDocument({
                model: 5,
                name: '500 FIAT',
                productionDate: new Date()
            })
            const paginator: IPaginator = { from: DEFAULT_PAGINATOR.FROM, size: 2 }
            const allCars = await cars.findDocuments({ paginator })
            expect(allCars.documents.length).toBe(2)
            expect(allCars.total).toBe(5)
            const paginator2: IPaginator = { from: DEFAULT_PAGINATOR.FROM } as IPaginator
            const allCars2 = await cars.findDocuments({ paginator: paginator2 })
            expect(allCars2.documents.length).toBe(5)
            expect(allCars2.total).toBe(5)
        })

        it(`Should delete all cars`, async () => {
            const cars = service.getCollection<Cars>(Cars.name)
            const paginator: IPaginator = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
            const allCars = await cars.findDocuments({ paginator })
            const ids = allCars.documents.map((car) => car._id)
            await cars.deleteDocuments({ _id: { $in: ids } })
            const allCarsAfterDelete = await cars.findDocuments({ paginator })
            expect(allCarsAfterDelete.total).toBe(0)
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

        it(`Should update a dog (id)`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const newDog = await dogs.createDocument(dog)
            const pluto = await dogs.updateDocument({ id: newDog.id }, { ...newDog, name: 'pluto' })
            expect(pluto).toHaveProperty('id')
            expect(pluto.name).toBe('pluto')
        })

        it(`Should find all the dogs with paginator`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const paginator: IPaginator = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
            const allDogs = await dogs.findDocuments({ paginator })
            expect(Array.isArray(allDogs.documents)).toBe(true)
            expect(allDogs.documents[0]).toHaveProperty('id')
        })

        it(`Should find all the dogs without any findDocumentsInput`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const allDogs = await dogs.findDocuments()
            expect(Array.isArray(allDogs.documents)).toBe(true)
            expect(allDogs.documents[0]).toHaveProperty('id')
        })

        it(`Should find all the dogs without paginator`, async () => {
            const dogs = service.getCollection<Dogs>(Dogs.name)
            const allDogs = await dogs.findDocuments({ filter: {} })
            expect(Array.isArray(allDogs.documents)).toBe(true)
            expect(allDogs.total).toBe(2)
        })
    })
})
