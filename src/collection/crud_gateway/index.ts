import { ICrudGateway, ICrudGatewayUpdateInput } from '../../types'
import { v4 } from 'uuid'
import { FilterQuery } from 'mongodb'

export const defaultCrudGateway: ICrudGateway = {
    create: {
        before: (document: any): any => document,
        after: (document: any): any => document
    },
    read: {
        before: (input: FilterQuery<any>): any => input,
        after: (document: any): any => document
    },
    update: {
        before: (input: ICrudGatewayUpdateInput): any => input,
        after: (document: any): any => document
    },
    delete: {
        before: (document: FilterQuery<any>): any => document,
        after: (document: any): any => document
    },
    list: {
        before: (input: FilterQuery<any>): any => input,
        after: (documents: any): any => documents
    }
}

export const uuidCrudGateway: ICrudGateway = {
    create: {
        before: (document: any): any => ({ _id: v4(), ...document }),
        after: (document: any): any => convert_Id(document)
    },
    read: {
        before: (filter: FilterQuery<any>): any => convertId(filter),
        after: (document: any): any => convert_Id(document)
    },
    update: {
        before: (input: ICrudGatewayUpdateInput): any => ({
            document: convertId(input.document),
            filters: convertId(input.filters)
        }),
        after: (document: any): any => convert_Id(document)
    },
    delete: {
        before: (document: FilterQuery<any>): any => document,
        after: (document: any): any => document
    },
    list: {
        before: (filter: FilterQuery<any>): any => convertId(filter),
        after: (documents: any): any => documents.map((document: unknown) => convert_Id(document))
    }
}

export function convertId(input: any): any {
    if (input?.id) {
        const { id: _id, ...rest } = input
        return { ...rest, _id }
    }
    return input
}

export function convert_Id(input: any): any {
    if (input?._id) {
        const { _id: id, ...rest } = input
        return { ...rest, id }
    }
    return input
}
