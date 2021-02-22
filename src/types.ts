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

    populateFields(fields: string[]): Record<string, number>
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
        before(document: any): any
        after(document: any): any
    }
    read: {
        before(filters: FilterQuery<any>): any
        after(document: any): any
    }
    update: {
        before(input: ICrudGatewayUpdateInput): any
        after(document: any): any
    }
    delete: {
        before(filters: FilterQuery<any>): any
        after(document: any): any
    }
    list: {
        before(input: FilterQuery<any>): any
        after(documents: any): any
    }
}

export interface ICrudGatewayUpdateInput {
    filters: FilterQuery<any>
    document?: any
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
