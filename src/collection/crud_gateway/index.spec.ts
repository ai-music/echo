import { defaultCrudGateway, uuidCrudGateway, uuidUserCrudGateway } from './index'

describe('CrudGateway', () => {
    it('Default gateway should never affect the input', () => {
        const test = { test: 'test' }
        const tests = [{ test: 'test' }]

        expect(test).toBe(defaultCrudGateway.create.before(test))
        expect(test).toBe(defaultCrudGateway.create.after(test))

        expect(test).toBe(defaultCrudGateway.read.before(test))
        expect(test).toBe(defaultCrudGateway.read.after(test))

        expect(test).toBe(defaultCrudGateway.update.before(test))
        expect(test).toBe(defaultCrudGateway.update.after(test))

        expect(test).toBe(defaultCrudGateway.delete.before(test))
        expect(test).toBe(defaultCrudGateway.delete.after(test))

        expect(tests).toBe(defaultCrudGateway.list.before(tests))
        expect(tests).toBe(defaultCrudGateway.list.after(tests))
    })

    it('UUID gateway', () => {
        const test = { test: 'test' }
        const tests = [{ test: 'test' }]

        const beforeCreate = uuidCrudGateway.create.before(test)
        expect(beforeCreate).toHaveProperty('_id')
        expect(uuidCrudGateway.create.after(beforeCreate)).toHaveProperty('id')

        expect(uuidCrudGateway.read.before(test)).toBe(test)
        expect(uuidCrudGateway.read.after(test)).toHaveProperty('id')

        expect(uuidCrudGateway.update.before(test)).toBe(test)
        expect(uuidCrudGateway.update.after(test)).toBe(test)

        expect(uuidCrudGateway.delete.before(test)).toBe(test)
        expect(uuidCrudGateway.delete.after(test)).toBe(test)

        expect(uuidCrudGateway.list.before(tests)).toBe(tests)
        expect(uuidCrudGateway.list.after(tests)[0]).toHaveProperty('id')
    })

    it('UUID User gateway', () => {
        const test = { test: 'test', password: 'topolino' }
        const tests = [{ test: 'test', password: 'topolino' }]

        const beforeCreate = uuidUserCrudGateway.create.before(test)
        expect(beforeCreate).toHaveProperty('_id')
        expect(beforeCreate).toHaveProperty('password')
        expect(uuidUserCrudGateway.create.after(beforeCreate)).toHaveProperty('id')
        expect(uuidUserCrudGateway.create.after(beforeCreate)).not.toHaveProperty('password')

        expect(uuidUserCrudGateway.read.before(test)).toBe(test)
        expect(uuidUserCrudGateway.read.after(test)).toHaveProperty('id')
        expect(uuidUserCrudGateway.read.after(test)).not.toHaveProperty('password')

        expect(uuidUserCrudGateway.update.before(test)).toBe(test)
        expect(uuidUserCrudGateway.update.after(test)).toHaveProperty('id')
        expect(uuidUserCrudGateway.update.after(test)).not.toHaveProperty('password')

        expect(uuidUserCrudGateway.delete.before(test)).toBe(test)
        expect(uuidUserCrudGateway.delete.after(test)).toBe(test)

        expect(uuidUserCrudGateway.list.before(tests)).toBe(tests)
        expect(uuidUserCrudGateway.list.after(tests)[0]).toHaveProperty('id')
        expect(uuidUserCrudGateway.list.after(tests)[0]).not.toHaveProperty('password')
    })
})
