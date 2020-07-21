import { Collection, CrudGateway, Field, uuidCrudGateway } from '../../src/index'

import { AbstractCollection } from '../../src/collection'

interface IDog {
    name: string
    breed: string
    birthDate: Date
}

@Collection
@CrudGateway(uuidCrudGateway)
export class Dogs extends AbstractCollection<IDog> {
    @Field()
    protected name: string

    @Field()
    protected breed: string

    @Field()
    protected birthDate: Date
}
