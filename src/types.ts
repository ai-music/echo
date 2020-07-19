import { Collection, MongoClient } from 'mongodb'

export type TMongoTypes =
    | 'double'
    | 'string'
    | 'object'
    | 'array'
    | 'binData'
    | 'objectId'
    | 'bool'
    | 'date'
    | 'null'
    | 'regex'
    | 'javascript'
    | 'javascriptWithScope'
    | 'int'
    | 'timestamp'
    | 'long'
    | 'decimal'
    | 'minKey'
    | 'maxKey'

export interface IFieldConfig {
    type: TMongoTypes
}

export interface IField {
    label: string
    collection: string
    config: IFieldConfig
    required?: boolean
}

export interface IIndex {
    label: string
    collection: string
    config: object
}

export interface IMongoSchema {
    $jsonSchema: {
        required?: string[]
        properties: Record<string, object>
    }
}

export interface IMongoStorageConfig {
    fields?: IField[]
    indexes?: IIndex[]
}

export enum MONGO_CONFIG_STORAGE_KEY {
    FIELDS = 'fields',
    INDEXES = 'indexes'
}

export interface ICollection<T> {
    schema?: IMongoSchema
    indexes?: IIndex[]

    createCollection(): Promise<Collection<T>>

    updateSchema(): Promise<Collection<T>>

    createIndex(indexConfig: object): Promise<string>

    createDocument(document: T): Promise<T>

    findOne(filter: object): Promise<T>

    find(filter?: object): Promise<T[]>
}

export interface ICollectionConfig {
    collectionName: string
    client: MongoClient
    schema: IMongoSchema
    indexes: IIndex[]
    crudGateway: ICrudGateway
}

export interface ICollectionBuilder {
    schema?: IMongoSchema
    indexes?: IIndex[]
    crudGateway?: ICrudGateway

    new (config: ICollectionConfig): ICollection<any>
}

export interface ICrudGateway {
    create: {
        before<T>(document: T): T
        after<T>(document: T): T
    }
    read: {
        before(input: unknown): unknown
        after<T>(document: T): T
    }
    update: {
        before<T>(document: T): T
        after<T>(document: T): T
    }
    delete: {
        before<T>(document: T): T
        after<T>(document: T): T
    }
    list: {
        before(input: unknown): unknown
        after(documents: any[]): any[]
    }
}

export type CollectionConstructor<T = {}> = new (...args: any[]) => T
