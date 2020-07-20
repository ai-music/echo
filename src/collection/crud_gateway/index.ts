import { ICrudGateway } from '../../types'
import { v4 } from 'uuid'

export const defaultCrudGateway: ICrudGateway = {
    create: {
        before: <T>(document: T): T => document,
        after: <T>(document: T): T => document
    },
    read: {
        before: (input: unknown): unknown => input,
        after: <T>(document: T): T => document
    },
    update: {
        before: <T>(document: T): T => document,
        after: <T>(document: T): T => document
    },
    delete: {
        before: <T>(document: T): T => document,
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
        after: <T>({ _id: id, ...rest }: any): T => ({ id, ...rest })
    },
    read: {
        before: (input: unknown): unknown => input,
        after: <T>({ _id: id, ...rest }: any): T => ({ id, ...rest })
    },
    update: {
        before: <T>(document: T): T => document,
        after: <T>(document: T): T => document
    },
    delete: {
        before: <T>(document: T): T => document,
        after: <T>(document: T): T => document
    },
    list: {
        before: (input: unknown): unknown => input,
        after: <T>(documents: unknown[]): T[] => {
            return documents.map((document: any) => {
                const { _id: id, ...rest } = document
                return { ...rest, id }
            })
        }
    }
}
