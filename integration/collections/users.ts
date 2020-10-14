import { Collection, Field, AbstractCollection } from '../../src'

interface IUser {
    firstName: string
    lastName: string
    email: string
    createdAt: Date
}

@Collection
export class Users extends AbstractCollection<IUser> {
    @Field()
    protected firstName: string

    @Field()
    protected lastName: string

    @Field({ index: { order: 1, unique: true } })
    protected email: string

    @Field()
    protected createdAt: Date
}
