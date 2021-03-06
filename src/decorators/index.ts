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

export function Collection<
    TBase extends CollectionConstructor & { schema?: object; indexes?: IIndex[]; crudGateway?: ICrudGateway }
>(Base: TBase): TBase {
    const collectionName = Base.name.toLowerCase()
    const conf = Storage.getConfig().get(collectionName)
    if (!conf) {
        throw new Error(`Collection decorator: not config found for collection: ${collectionName}`)
    }
    Base.schema = buildMongoSchema(conf)
    Base.indexes = conf.indexes || []
    if (!Base.crudGateway) {
        Base.crudGateway = defaultCrudGateway
    }
    return Base
}

export function CrudGateway(crudGateway?: ICrudGateway) {
    return function (target: ICollectionBuilder): any {
        target.crudGateway = crudGateway || defaultCrudGateway
    }
}

export function Field(fieldConfig?: IFieldConfig): any {
    return function (target: ICollection<unknown>, propertyKey: string): void {
        const storageConfig = {
            collection: target.constructor.name.toLowerCase(),
            label: propertyKey
        }
        let type = fieldConfig?.type
        if (!fieldConfig?.type) {
            type = resolveFieldType(target, propertyKey)
        }
        Storage.updateStorage({ ...storageConfig, config: { type } }, MONGO_CONFIG_STORAGE_KEY.FIELDS)
        if (fieldConfig?.index) {
            const config = [
                { [propertyKey]: fieldConfig.index.order || 1 },
                { unique: fieldConfig.index.unique || false }
            ]
            Storage.updateStorage({ ...storageConfig, config }, MONGO_CONFIG_STORAGE_KEY.INDEXES)
        }
    }
}

export function resolveFieldType(target: ICollection<unknown>, propertyKey: string): TMongoTypes {
    const autoType = Reflect.getMetadata('design:type', target, propertyKey)
    if (!autoType || !autoType.name) {
        throw TypeError(`Invalid type provided for ${target.toString()} - ${propertyKey}`)
    }
    let { name } = autoType
    name = name === 'Boolean' ? 'bool' : name
    return name.toLowerCase()
}

export function buildMongoSchema(collectionConfig: IMongoStorageConfig): IMongoSchema {
    const basicSchema: IMongoSchema = {
        $jsonSchema: {
            // TODO @Diego: required: [],
            properties: {}
        }
    }
    Array.isArray(collectionConfig.fields) &&
        collectionConfig.fields.forEach((field) => {
            basicSchema.$jsonSchema.properties[field.label] = {
                bsonType: field.config.type
            }
        })
    return basicSchema
}
