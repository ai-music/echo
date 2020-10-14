import { Collection, Field, AbstractCollection } from '../../src'

export interface ISpaceships {
    model: string
    weapons: number
    faction: string
    productionDate: Date
    hyperdrive: boolean | string
}

@Collection
export class Spaceships extends AbstractCollection<ISpaceships> {
    @Field({ index: { order: 1, unique: true } })
    protected model: string

    @Field({ index: { order: 1, unique: false } })
    protected weapons: number

    @Field()
    protected faction: string

    @Field()
    protected productionDate: Date

    @Field({ type: 'bool' })
    protected hyperdrive: string
}
