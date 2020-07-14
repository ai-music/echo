import {
    CollectionConstructor,
    IFieldConfig,
    IMongoSchema,
    IMongoStorageConfig,
    MONGO_CONFIG_STORAGE_KEY,
    TMongoTypes
} from '../types'
import { ConfigStorage } from '../storage'
import 'reflect-metadata'

export function Collection<TBase extends CollectionConstructor & { _schema?: object }>(Base: TBase): TBase {
    const collectionName = Base.name.toLowerCase()
    const conf = ConfigStorage.getConfig().get(collectionName)
    if (!conf) {
        throw new Error(`Collection decorator: not config found for collection: ${collectionName}`)
    }
    Base._schema = buildMongoSchema(conf)
    return Base
}

export function Field(config?: IFieldConfig): any {
    return function(target: object, propertyKey: string): void {
        let type = config?.type
        if (!config) {
            type = resolveFieldType(target, propertyKey)
        }
        ConfigStorage.updateStorage({
            collection: target.constructor.name.toLowerCase(),
            label: propertyKey,
            config: {
                type
            }
        }, MONGO_CONFIG_STORAGE_KEY.FIELDS)
    }
}

export function IndexUnique(order = 1) {
    return function(target: object, propertyKey: string): void {
        const mongoIndex = [ { [propertyKey]: order }, { unique: true } ]
        ConfigStorage.updateStorage({
            collection: target.constructor.name.toLowerCase(),
            label: propertyKey,
            config: mongoIndex
        }, MONGO_CONFIG_STORAGE_KEY.INDEXES)
    }
}

export function resolveFieldType(target: object, propertyKey: string): TMongoTypes {
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
            type: field.config.type
        }
    })
    return basicSchema
}