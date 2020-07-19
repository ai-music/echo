import {
    CollectionConstructor,
    ICollection,
    ICollectionBuilder,
    ICrudGateway,
    IFieldConfig,
    IIndex,
    IMongoSchema,
    IMongoStorageConfig,
    MONGO_CONFIG_STORAGE_KEY,
    TMongoTypes
} from '../types'
import { Storage } from '../storage'
import 'reflect-metadata'
import { defaultCrudGateway } from '../collection/crud_gateway'

export function Collection<TBase extends CollectionConstructor & { schema?: object; indexes?: IIndex[] }>(
    Base: TBase
): TBase {
    const collectionName = Base.name.toLowerCase()
    const conf = Storage.getConfig().get(collectionName)
    if (!conf) {
        throw new Error(`Collection decorator: not config found for collection: ${collectionName}`)
    }
    Base.schema = buildMongoSchema(conf)
    Base.indexes = conf.indexes || []
    return Base
}

export function CrudGateway(crudGateway: ICrudGateway) {
    return function (target: ICollectionBuilder): any {
        target.crudGateway = crudGateway || defaultCrudGateway
    }
}

export function Field(config?: IFieldConfig): any {
    return function (target: ICollection<unknown>, propertyKey: string): void {
        let type = config?.type
        if (!config) {
            type = resolveFieldType(target, propertyKey)
        }
        Storage.updateStorage(
            {
                collection: target.constructor.name.toLowerCase(),
                label: propertyKey,
                config: { type }
            },
            MONGO_CONFIG_STORAGE_KEY.FIELDS
        )
    }
}

export function IndexUnique(order = 1) {
    return function (target: ICollection<unknown>, propertyKey: string): void {
        const mongoIndex = [{ [propertyKey]: order }, { unique: true }]
        Storage.updateStorage(
            {
                collection: target.constructor.name.toLowerCase(),
                label: propertyKey,
                config: mongoIndex
            },
            MONGO_CONFIG_STORAGE_KEY.INDEXES
        )
    }
}

export function resolveFieldType(target: ICollection<unknown>, propertyKey: string): TMongoTypes {
    const autoType = Reflect.getMetadata('design:type', target, propertyKey)
    if (!autoType) {
        throw TypeError(`Invalid type provided for ${target} - ${propertyKey}`)
    }
    return autoType.name.toLowerCase()
}

export function buildMongoSchema(collectionConfig: IMongoStorageConfig): IMongoSchema {
    const basicSchema: IMongoSchema = {
        $jsonSchema: {
            // TODO @Diego: required: [],
            properties: {}
        }
    }
    collectionConfig.fields.forEach((field) => {
        basicSchema.$jsonSchema.properties[field.label] = {
            bsonType: field.config.type
        }
    })
    return basicSchema
}
