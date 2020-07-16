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

export interface ICollection {
    schema?: IMongoSchema

    createCollection<T>(): Promise<Collection<T>>

    updateSchema<T>(): Promise<Collection<T>>
}

export interface ICollectionBuilder {
    schema?: IMongoSchema

    new (client: MongoClient, collectionName: string, schema: IMongoSchema): ICollection
}

export type CollectionConstructor<T = {}> = new (...args: any[]) => T
