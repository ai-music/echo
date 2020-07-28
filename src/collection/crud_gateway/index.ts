import { ICrudGateway, ICrudGatewayUpdateInput } from '../../types'
import { v4 } from 'uuid'
import { FilterQuery } from 'mongodb'

export const defaultCrudGateway: ICrudGateway = {
    create: {
        before: <T>(document: T): T => document,
        after: <T>(document: T): T => document
    },
    read: {
        before: <T>(input: FilterQuery<T>): any => input,
        after: <T>(document: T): T => document
    },
    update: {
        before: <T>(input: ICrudGatewayUpdateInput<T>): any => input,
        after: <T>(document: T): T => document
    },
    delete: {
        before: <T>(document: FilterQuery<T>): any => document,
        after: <T>(document: T): T => document
    },
    list: {
        before: (input: unknown): unknown => input,
        after: <T>(documents: []): T[] => documents
    }
}

export const uuidCrudGateway: ICrudGateway = {
    create: {
        before: <T>(document: T): T => ({ _id: v4(), ...document }),
        after: <T>(document: T): T => convert_Id(document)
    },
    read: {
        before: <T>(filter: FilterQuery<T>): any => convertId(filter),
        after: <T>(document: T): T => convert_Id(document)
    },
    update: {
        before: <T>(input: ICrudGatewayUpdateInput<T>): any => ({
            document: convertId(input.document),
            filters: convertId(input.filters)
        }),
        after: <T>(document: T): T => convert_Id(document)
    },
    delete: {
        before: <T>(document: FilterQuery<T>): any => document,
        after: <T>(document: T): T => document
    },
    list: {
        before: (input: unknown): unknown => input,
        after: <T>(documents: unknown[]): T[] => documents.map((document: T) => convert_Id(document))
    }
}

export function convertId(input: any): any {
    if (input.id) {
        const { id: _id, ...rest } = input
        return { ...rest, _id }
    }
    return input
}

export function convert_Id(input: any): any {
    if (input._id) {
        const { _id: id, ...rest } = input
        return { ...rest, id }
    }
    return input
}
