import { Collection, Field, IndexUnique, AbstractCollection } from '../../src'

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

    @Field()
    @IndexUnique()
    protected email: string

    @Field()
    protected createdAt: Date
}
