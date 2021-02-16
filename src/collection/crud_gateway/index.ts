import { ICrudGateway, ICrudGatewayUpdateInput } from '../../types'
import { v4 } from 'uuid'
import { FilterQuery } from 'mongodb'

export const defaultCrudGateway: ICrudGateway = {
    create: {
        before: (document: Record<string, unknown>): any => document,
        after: (document: Record<string, unknown>): any => document
    },
    read: {
        before: (input: FilterQuery<Record<string, unknown>>): any => input,
        after: (document: Record<string, unknown>): any => document
    },
    update: {
        before: (input: ICrudGatewayUpdateInput): any => input,
        after: (document: Record<string, unknown>): any => document
    },
    delete: {
        before: (document: FilterQuery<Record<string, unknown>>): any => document,
        after: (document: Record<string, unknown>): any => document
    },
    list: {
        before: (input: Record<string, unknown>): any => input,
        after: (documents: Record<string, unknown>[]): any => documents
    }
}

export const uuidCrudGateway: ICrudGateway = {
    create: {
        before: (document: Record<string, unknown>): any => ({ _id: v4(), ...document }),
        after: (document: Record<string, unknown>): any => convert_Id(document)
    },
    read: {
        before: (filter: FilterQuery<Record<string, unknown>>): any => convertId(filter),
        after: (document: Record<string, unknown>): any => convert_Id(document)
    },
    update: {
        before: (input: ICrudGatewayUpdateInput): any => ({
            document: convertId(input.document),
            filters: convertId(input.filters)
        }),
        after: (document: Record<string, unknown>): any => convert_Id(document)
    },
    delete: {
        before: (document: FilterQuery<Record<string, unknown>>): any => document,
        after: (document: Record<string, unknown>): any => document
    },
    list: {
        before: (filter: FilterQuery<Record<string, unknown>>): any => convertId(filter),
        after: (documents: Record<string, unknown>[]): any => documents.map((document: unknown) => convert_Id(document))
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
