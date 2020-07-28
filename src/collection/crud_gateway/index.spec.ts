import { defaultCrudGateway, uuidCrudGateway } from './index'

describe('CrudGateway', () => {
    const test = { test: 'test' }
    const tests = [{ test: 'test' }]
    const updateInput = {
        filters: {},
        document: test
    }
    it('Default gateway should never affect the input', () => {
        expect(test).toBe(defaultCrudGateway.create.before(test))
        expect(test).toBe(defaultCrudGateway.create.after(test))

        expect(test).toBe(defaultCrudGateway.read.before(test))
        expect(test).toBe(defaultCrudGateway.read.after(test))

        expect(updateInput).toBe(defaultCrudGateway.update.before(updateInput))
        expect(test).toBe(defaultCrudGateway.update.after(test))

        expect(test).toBe(defaultCrudGateway.delete.before(test))
        expect(test).toBe(defaultCrudGateway.delete.after(test))

        expect(tests).toBe(defaultCrudGateway.list.before(tests))
        expect(tests).toBe(defaultCrudGateway.list.after(tests))
    })

    it('UUID gateway', () => {
        const test = { test: 'test' }
        const tests = [{ test: 'test', _id: 'test' }]
        const beforeCreate = uuidCrudGateway.create.before(test)

        expect(beforeCreate).toHaveProperty('_id')
        expect(uuidCrudGateway.create.after(beforeCreate)).toHaveProperty('id')
        // Passing id should return _id
        const testId = { ...test, id: 'test_my_id' }
        expect(uuidCrudGateway.read.before(testId)).toHaveProperty('_id')
        // Passing _id should return _id
        expect(uuidCrudGateway.read.before(beforeCreate)).toHaveProperty('_id')
        // Passing _id should return id
        expect(uuidCrudGateway.read.after(beforeCreate)).toHaveProperty('id')
        const updateTest = { filters: { id: 'testFilter' }, document: { id: 'testDocument' } }
        const updateResult = uuidCrudGateway.update.before(updateTest)
        expect(updateResult.document).toHaveProperty('_id')
        expect(updateResult.filters).toHaveProperty('_id')
        expect(uuidCrudGateway.update.after(updateResult.document)).toHaveProperty('id')
        expect(uuidCrudGateway.delete.before(test)).toBe(test)
        expect(uuidCrudGateway.delete.after(test)).toBe(test)
        expect(uuidCrudGateway.list.before(tests)).toBe(tests)
        expect(uuidCrudGateway.list.after(tests)[0]).toHaveProperty('id')
    })
})
