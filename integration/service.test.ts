import { MongoDBService } from '../src/service'
import { Cars } from './collections/cars'
import { Users } from './collections/users'
import { Dogs } from './collections/dogs'
import { Spaceships, ISpaceships } from './collections/spaceships'
import { DEFAULT_PAGINATOR, IPaginatorInput } from '../src'
import { ObjectID } from 'mongodb'

describe('Service', () => {
    let service: MongoDBService = null

    beforeAll(async () => {
        const connection = 'mongodb://echo-mongodb-tests:27017/tests'
        service = MongoDBService.factory(connection, 'tests')
        service.registerCollection(Cars)
        service.registerCollection(Users)
        service.registerCollection(Dogs)
        service.registerCollection(Spaceships)
        await service.connect()
    }, 30_000)

    afterAll(async () => {
        await service.disconnect()
    })

    describe('Simple collection', () => {
        let cars: Cars

        beforeAll(() => {
            cars = service.getCollection<Cars>(Cars.name)
        })

        it(`Should build a simple collection`, async () => {
            expect(cars).toBeInstanceOf(Cars)
        })

        it(`Create a car`, async () => {
            const car = await cars.createDocument({
                model: 1,
                name: '500 FIAT',
                productionDate: new Date()
            })
            expect(car).toHaveProperty('_id')
            expect(car._id).toBeInstanceOf(ObjectID)
            expect(car).toHaveProperty('name')
            expect(car).toHaveProperty('model')
            expect(car).toHaveProperty('productionDate')
            expect(typeof car.name).toBe('string')
            expect(typeof car.model).toBe('number')
            expect(car.productionDate).toBeInstanceOf(Date)
        })

        it('Should update the car', async () => {
            const car = await cars.createDocument({
                model: 2,
                name: '500 FIAT',
                productionDate: new Date()
            })
            const updatedCar = await cars.updateDocument({ _id: car._id }, { ...car, model: 200 })
            expect(updatedCar.model).toBe(200)
        })

        it('should list all the cars', async () => {
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
            const paginator: IPaginatorInput = { from: DEFAULT_PAGINATOR.FROM, size: 2 }
            const allCars = await cars.findDocuments({ paginator })
            expect(allCars.data.length).toBe(2)
            expect(allCars.paginator.total).toBe(2)
            const paginator2: Partial<IPaginatorInput> = { from: DEFAULT_PAGINATOR.FROM }
            const allCars2 = await cars.findDocuments({ paginator: paginator2 })
            expect(allCars2.data.length).toBe(5)
            expect(allCars2.paginator.total).toBe(5)
        })

        it(`Should delete all cars`, async () => {
            const paginator: IPaginatorInput = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
            const allCars = await cars.findDocuments({ paginator })
            const ids = allCars.data.map((car) => car._id)
            await cars.deleteDocuments({ _id: { $in: ids } })
            const allCarsAfterDelete = await cars.findDocuments({ paginator })
            expect(allCarsAfterDelete.paginator.total).toBe(0)
        })
    })

    describe('Indexes', () => {
        const user = {
            firstName: 'Mario',
            lastName: 'Bros',
            email: 'mario@bros.com'
        }
        let users: Users
        let spaceships: Spaceships

        beforeAll(() => {
            users = service.getCollection<Users>(Users.name)
            spaceships = service.getCollection<Spaceships>(Spaceships.name)
        })

        afterAll(async () => {
            await users.deleteDocuments()
            await spaceships.deleteDocuments()
        })

        it(`Should create a user`, async () => {
            const newUser = await users.createDocument(user)
            expect(newUser).toHaveProperty('_id')
        })

        it(`Should Fail because of duplicate key`, async () => {
            const error = await users.createDocument(user).catch((e) => e.message)
            expect(error).toContain('E11000 duplicate key error collection')
        })

        it('Should apply the correct indexes to the collection', async () => {
            const xwing = {
                model: 'X-Wing',
                weapons: 6,
                faction: 'Rebel Alliance',
                productionDate: new Date(),
                hyperdrive: true
            }
            await spaceships.createDocument(xwing)
            const indexes = spaceships.indexes.map((index) => index.label)
            expect(indexes.length).toBe(2)
            expect(indexes.includes('model')).toBe(true)
            expect(indexes.includes('weapons')).toBe(true)
        })

        it('Should fail to create a spaceship with a duplicate model', async () => {
            const xwing = {
                model: 'X-Wing',
                weapons: 6,
                faction: 'New Republic',
                productionDate: new Date(),
                hyperdrive: true
            }
            const response = await spaceships.createDocument(xwing).catch((err) => err)
            expect(response.message).toContain('duplicate key error')
        })

        it('Should prioritise the type passed in the decorator over the type defined in the class', async () => {
            const badPayload: ISpaceships = {
                model: 'TIE Fighter',
                weapons: 3,
                faction: 'Empire',
                productionDate: new Date(),
                hyperdrive: 'true'
            }
            const errorResponse = await spaceships.createDocument(badPayload).catch((err) => err)
            expect(errorResponse.message).toContain('Document failed validation')
            const goodPayload = { ...badPayload, hyperdrive: true }
            const response = await spaceships.createDocument(goodPayload).catch((err) => err)
            expect(response._id).toBeInstanceOf(ObjectID)
            expect(response).toStrictEqual(goodPayload)
        })
    })

    describe('UUID crudGateway', () => {
        let dogs: Dogs
        const dog = {
            name: 'Fido',
            breed: 'Australian Kelpie',
            birthDate: new Date()
        }

        beforeAll(() => {
            dogs = service.getCollection<Dogs>(Dogs.name)
        })

        afterAll(async () => {
            await dogs.deleteDocuments()
        })

        it(`Should create a dog`, async () => {
            const newDog = await dogs.createDocument(dog)
            expect(newDog).toHaveProperty('id')
        })

        it(`Should find a dog (id)`, async () => {
            const fido = await dogs.findDocument({ name: dog.name })
            expect(fido).toHaveProperty('id')
        })

        it(`Should update a dog (id)`, async () => {
            const newDog = await dogs.createDocument(dog)
            const pluto = await dogs.updateDocument({ id: newDog.id }, { ...newDog, name: 'pluto' })
            expect(pluto).toHaveProperty('id')
            expect(pluto.name).toBe('pluto')
        })

        it(`Should find all the dogs with paginator`, async () => {
            const paginator: IPaginatorInput = { from: DEFAULT_PAGINATOR.FROM, size: DEFAULT_PAGINATOR.SIZE }
            const allDogs = await dogs.findDocuments({ paginator })
            expect(Array.isArray(allDogs.data)).toBe(true)
            expect(allDogs.data[0]).toHaveProperty('id')
        })

        it(`Should find all the dogs without any findDocumentsInput`, async () => {
            const allDogs = await dogs.findDocuments()
            expect(Array.isArray(allDogs.data)).toBe(true)
            expect(allDogs.data[0]).toHaveProperty('id')
        })

        it(`Should find all the dogs without paginator`, async () => {
            const allDogs = await dogs.findDocuments({ filters: {} })
            expect(Array.isArray(allDogs.data)).toBe(true)
            expect(allDogs.paginator.total).toBe(2)
        })
    })
})
