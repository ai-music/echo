import { Collection, Field, AbstractCollection } from '../../src'

interface ICar {
    name: string
    model: number
    productionDate: Date
}

@Collection
export class Cars extends AbstractCollection<ICar> {
    @Field()
    protected name: string

    @Field()
    protected model: number

    @Field()
    protected productionDate: Date
}
