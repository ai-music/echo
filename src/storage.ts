import { IField, IIndex, IMongoStorageConfig, MONGO_CONFIG_STORAGE_KEY } from './types'

export class Storage {
    private static config: Map<string, IMongoStorageConfig> = new Map()

    public static updateStorage(field: IField | IIndex, key: MONGO_CONFIG_STORAGE_KEY): void {
        if (!Storage.config.has(field.collection)) {
            Storage.config.set(field.collection, { [key]: [field] })
            return
        }
        const collection = Storage.config.get(field.collection)
        Storage.config.set(field.collection, { ...collection, [key]: [...(collection[key] || []), field] })
    }

    public static getConfig(): Map<string, IMongoStorageConfig> {
        return Storage.config
    }
}
