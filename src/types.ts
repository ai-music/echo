import { Collection, FilterQuery, MongoClient } from 'mongodb'

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

export interface IIndexConfig {
    unique?: boolean
    order?: number
}

export interface IFieldConfig {
    type?: TMongoTypes
    index?: IIndexConfig
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

    findDocument(filter: FilterQuery<T>, fieldsToPopulate?: string[]): Promise<T>

    findDocuments(
        findDocumentInput?: IFindDocumentsInput<T>,
        fieldsToPopulate?: string[]
    ): Promise<IDocumentsResponse<T>>

    findPaginatedDocuments(
        findPaginatedDocumentInput?: IFindPaginatedDocuments<T>,
        fieldsToPopulate?: string[]
    ): Promise<IPaginatedDocumentsResponse<T>>
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
        before<T>(filters: FilterQuery<T>): T
        after<T>(document: T): T
    }
    update: {
        before<T>(input: ICrudGatewayUpdateInput<T>): ICrudGatewayUpdateInput<T>
        after<T>(document: T): T
    }
    delete: {
        before<T>(filters: FilterQuery<T>): T
        after<T>(document: T): T
    }
    list: {
        before(input: unknown): unknown
        after(documents: any[]): any[]
    }
}

export interface ICrudGatewayUpdateInput<T> {
    filters: FilterQuery<T>
    document?: T
}

export type CollectionConstructor<T = {}> = new (...args: any[]) => T

export interface IDocumentsResponse<T> {
    data: T[]
}

export interface IPaginatedDocumentsResponse<T> extends IDocumentsResponse<T> {
    paginator: Partial<IPaginatorOutput>
}

export enum DEFAULT_PAGINATOR {
    FROM = 0,
    SIZE = 25
}

export interface IPaginatorInput {
    from: number
    size: number
}

export interface IPaginatorOutput extends IPaginatorInput {
    total: number
}

export interface IFindDocumentsInput<T> {
    filters?: FilterQuery<T>
}

export interface IFindPaginatedDocuments<T> extends IFindDocumentsInput<T> {
    paginator?: Partial<IPaginatorInput>
}
