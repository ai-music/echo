import { Collection, CrudGateway, Field, resolveFieldType } from './index'
import { defaultCrudGateway, uuidCrudGateway } from '../collection/crud_gateway'
import { ICollection, ICollectionBuilder } from '../types'
import { AbstractCollection } from '../collection'

describe('Decorators', () => {
    it('[CrudGateway] Should set correctly defaultCrudGateway', () => {
        const decorate = CrudGateway(defaultCrudGateway)
        const type = {} as ICollectionBuilder
        decorate(type)
        expect(type.crudGateway).toBe(defaultCrudGateway)
    })

    it('[CrudGateway] Should set correctly uuidCrudGateway', () => {
        const decorate = CrudGateway(uuidCrudGateway)
        const type = {} as ICollectionBuilder
        decorate(type)
        expect(type.crudGateway).toBe(uuidCrudGateway)
    })

    it('[Collection] Should fail to decorate a collection without fields', () => {
        class Test {}

        const decorate = Collection
        expect(() => decorate(Test)).toThrow('Collection decorator: not config found for collection: test')
    })

    it('[Field] Should fail to decorate a collection without fields', () => {
        @Collection
        class Test extends AbstractCollection<any> {
            @Field()
            protected test: string
        }

        expect(Test).toHaveProperty('schema')
        expect(Test).toHaveProperty('indexes')
        expect(Test).toHaveProperty('crudGateway')
    })

    it('[Field] Should fail autotype', () => {
        const test = {} as ICollection<any>
        expect(() => resolveFieldType(test, 'test')).toThrow('Invalid type provided for [object Object] - test')
    })

    it('[Field] Should be able to set an index to a field', () => {
        @Collection
        class Test extends AbstractCollection<any> {
            @Field()
            test: string

            @Field({ index: { order: 1, unique: true } })
            dexter: string
        }

        expect(Test).toHaveProperty('indexes')
    })
})
